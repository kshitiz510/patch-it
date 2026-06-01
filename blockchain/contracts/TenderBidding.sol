// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TenderBidding {
    enum ProjectStatus {
        Reported,
        OpenForBidding,
        BidSelected,
        WorkInProgress,
        Completed,
        Verified,
        PaymentReleased
    }

    struct Bid {
        address contractor;
        uint256 amount;
        uint256 rankingScore;
        string metadataURI;
        bool exists;
    }

    struct Project {
        string reportId;
        string locationKey;
        uint256 estimatedCost;
        ProjectStatus status;
        address winner;
        uint256 winningBid;
        uint256 escrow;
        address[] bidders;
        bool exists;
    }

    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bool) public contractors;
    mapping(bytes32 => Project) private projects;
    mapping(bytes32 => mapping(address => Bid)) private projectBids;
    bytes32[] private projectKeys;

    event ProjectCreated(bytes32 indexed projectKey, string reportId, uint256 estimatedCost);
    event BidPlaced(bytes32 indexed projectKey, address indexed contractor, uint256 amount, uint256 rankingScore);
    event WinnerSelected(bytes32 indexed projectKey, address indexed contractor, uint256 amount);
    event WorkStarted(bytes32 indexed projectKey, address indexed contractor);
    event WorkCompleted(bytes32 indexed projectKey, address indexed contractor);
    event CompletionVerified(bytes32 indexed projectKey);
    event PaymentReleased(bytes32 indexed projectKey, address indexed contractor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin");
        _;
    }

    modifier onlyContractor() {
        require(contractors[msg.sender], "Only contractor");
        _;
    }

    modifier projectExists(bytes32 projectKey) {
        require(projects[projectKey].exists, "Project not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function setAdmin(address account, bool enabled) external onlyOwner {
        admins[account] = enabled;
    }

    function registerContractor() external {
        contractors[msg.sender] = true;
    }

    function createProject(string calldata reportId, string calldata locationKey, uint256 estimatedCost)
        external
        payable
        onlyAdmin
        returns (bytes32)
    {
        require(bytes(reportId).length > 0, "Report required");
        require(estimatedCost > 0, "Estimate required");
        bytes32 projectKey = keccak256(abi.encodePacked(reportId));
        require(!projects[projectKey].exists, "Project exists");

        Project storage project = projects[projectKey];
        project.reportId = reportId;
        project.locationKey = locationKey;
        project.estimatedCost = estimatedCost;
        project.status = ProjectStatus.OpenForBidding;
        project.escrow = msg.value;
        project.exists = true;
        projectKeys.push(projectKey);

        emit ProjectCreated(projectKey, reportId, estimatedCost);
        return projectKey;
    }

    function submitBid(bytes32 projectKey, uint256 amount, uint256 rankingScore, string calldata metadataURI)
        external
        onlyContractor
        projectExists(projectKey)
    {
        Project storage project = projects[projectKey];
        require(project.status == ProjectStatus.OpenForBidding, "Bidding closed");
        require(amount > 0, "Amount required");
        require(rankingScore <= 100, "Invalid score");
        require(!projectBids[projectKey][msg.sender].exists, "Bid exists");

        projectBids[projectKey][msg.sender] = Bid({
            contractor: msg.sender,
            amount: amount,
            rankingScore: rankingScore,
            metadataURI: metadataURI,
            exists: true
        });
        project.bidders.push(msg.sender);

        emit BidPlaced(projectKey, msg.sender, amount, rankingScore);
    }

    function selectWinner(bytes32 projectKey, address contractor) external onlyAdmin projectExists(projectKey) {
        Project storage project = projects[projectKey];
        require(project.status == ProjectStatus.OpenForBidding, "Invalid status");
        Bid storage bid = projectBids[projectKey][contractor];
        require(bid.exists, "Bid not found");

        project.winner = contractor;
        project.winningBid = bid.amount;
        project.status = ProjectStatus.BidSelected;

        emit WinnerSelected(projectKey, contractor, bid.amount);
    }

    function markWorkStarted(bytes32 projectKey) external projectExists(projectKey) {
        Project storage project = projects[projectKey];
        require(msg.sender == project.winner, "Only winner");
        require(project.status == ProjectStatus.BidSelected, "Invalid status");
        project.status = ProjectStatus.WorkInProgress;
        emit WorkStarted(projectKey, msg.sender);
    }

    function markCompleted(bytes32 projectKey) external projectExists(projectKey) {
        Project storage project = projects[projectKey];
        require(msg.sender == project.winner, "Only winner");
        require(project.status == ProjectStatus.WorkInProgress, "Invalid status");
        project.status = ProjectStatus.Completed;
        emit WorkCompleted(projectKey, msg.sender);
    }

    function verifyCompletion(bytes32 projectKey) external onlyAdmin projectExists(projectKey) {
        Project storage project = projects[projectKey];
        require(project.status == ProjectStatus.Completed, "Invalid status");
        project.status = ProjectStatus.Verified;
        emit CompletionVerified(projectKey);
    }

    function releaseFunds(bytes32 projectKey) external onlyAdmin projectExists(projectKey) {
        Project storage project = projects[projectKey];
        require(project.status == ProjectStatus.Verified, "Invalid status");
        require(project.escrow >= project.winningBid, "Insufficient escrow");

        uint256 amount = project.winningBid;
        project.escrow -= amount;
        project.status = ProjectStatus.PaymentReleased;

        (bool ok, ) = payable(project.winner).call{value: amount}("");
        require(ok, "Payment failed");

        emit PaymentReleased(projectKey, project.winner, amount);
    }

    function getProject(bytes32 projectKey) external view projectExists(projectKey) returns (Project memory) {
        return projects[projectKey];
    }

    function getBid(bytes32 projectKey, address contractor) external view returns (Bid memory) {
        require(projectBids[projectKey][contractor].exists, "Bid not found");
        return projectBids[projectKey][contractor];
    }

    function listProjects() external view returns (bytes32[] memory) {
        return projectKeys;
    }

    function listBidders(bytes32 projectKey) external view projectExists(projectKey) returns (address[] memory) {
        return projects[projectKey].bidders;
    }
}
