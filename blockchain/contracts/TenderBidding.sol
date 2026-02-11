// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TenderBidding {

    struct Bidder {
        string name; // Bidder's name
        uint256 amount; // Bidder's bid amount
    }

    struct Tender {
        string uniqueKey; // Unique key in the format "latitude_longitude"
        bool isClosed; // If the tender is closed or not
        address winner; // The winner of the tender
        uint256 lowestBid; // The lowest bid amount
        uint256 baseAmount; // Base amount set during tender creation
        Bidder[] bids; // List of all bids placed for this tender
    }

    mapping(string => Tender) public tenders;
    string[] public tenderKeys;

    mapping(address => string) public bidderNames;
    mapping(address => bool) public admins;

    mapping(address => string[]) public bidderTenders; // Track tenders a bidder has participated in

    modifier onlyAdmin() {
        require(admins[msg.sender], "You are not the admin");
        _;
    }

    modifier tenderExists(string memory _key) {
        require(bytes(tenders[_key].uniqueKey).length != 0, "Tender does not exist");
        _;
    }

    function createAdmin(string memory _name) public {
        require(bytes(bidderNames[msg.sender]).length == 0, "Admin already exists");
        admins[msg.sender] = true;
        bidderNames[msg.sender] = _name;
    }

    function registerBidder(string memory _name) public {
        require(bytes(bidderNames[msg.sender]).length == 0, "Bidder already registered");
        bidderNames[msg.sender] = _name;
    }

    function createTender(string memory _latitude, string memory _longitude, uint256 _baseAmount) public onlyAdmin {
        string memory tenderKey = string(abi.encodePacked(_latitude, "_", _longitude));
        require(bytes(tenders[tenderKey].uniqueKey).length == 0, "Tender already exists");

        Tender storage newTender = tenders[tenderKey];
        newTender.uniqueKey = tenderKey;
        newTender.isClosed = false;
        newTender.lowestBid = type(uint256).max;
        newTender.baseAmount = _baseAmount;

        tenderKeys.push(tenderKey);
        emit TenderCreated(tenderKey, _baseAmount);
    }

    function placeBid(string memory _tenderKey, uint256 _amount) public tenderExists(_tenderKey) {
        Tender storage tender = tenders[_tenderKey];
        require(!tender.isClosed, "Tender is closed");
        require(bytes(bidderNames[msg.sender]).length > 0, "You must be a registered bidder");
        require(_amount <= (tender.baseAmount * 110) / 100, "Bid exceeds 110% of base amount");

        tender.bids.push(Bidder({name: bidderNames[msg.sender], amount: _amount}));

        sortBids(tender);

        if (_amount < tender.lowestBid) {
            tender.lowestBid = _amount;
            tender.winner = msg.sender;
        }

        // Track the tender for the bidder
        bool alreadyAdded = false;
        for (uint256 i = 0; i < bidderTenders[msg.sender].length; i++) {
            if (keccak256(abi.encodePacked(bidderTenders[msg.sender][i])) == keccak256(abi.encodePacked(_tenderKey))) {
                alreadyAdded = true;
                break;
            }
        }
        if (!alreadyAdded) {
            bidderTenders[msg.sender].push(_tenderKey);
        }
    }

    function sortBids(Tender storage _tender) internal {
        uint256 length = _tender.bids.length;
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                if (_tender.bids[i].amount > _tender.bids[j].amount) {
                    Bidder memory tempBid = _tender.bids[i];
                    _tender.bids[i] = _tender.bids[j];
                    _tender.bids[j] = tempBid;
                }
            }
        }
    }

    function closeTender(string memory _tenderKey) public onlyAdmin tenderExists(_tenderKey) {
        Tender storage tender = tenders[_tenderKey];
        require(!tender.isClosed, "Tender is already closed");

        tender.isClosed = true;
        emit TenderClosed(_tenderKey, tender.winner, tender.lowestBid);
    }

    function listOpenTenders() public view returns (string[] memory, uint256[] memory) {
        uint256 openCount = 0;
        for (uint256 i = 0; i < tenderKeys.length; i++) {
            if (!tenders[tenderKeys[i]].isClosed) {
                openCount++;
            }
        }

        string[] memory keys = new string[](openCount);
        uint256[] memory baseAmounts = new uint256[](openCount);

        uint256 index = 0;
        for (uint256 i = 0; i < tenderKeys.length; i++) {
            if (!tenders[tenderKeys[i]].isClosed) {
                keys[index] = tenderKeys[i];
                baseAmounts[index] = tenders[tenderKeys[i]].baseAmount;
                index++;
            }
        }

        return (keys, baseAmounts);
    }

    function listClosedTenders() public view returns (string[] memory, string[] memory, uint256[] memory) {
        uint256 closedCount = 0;
        for (uint256 i = 0; i < tenderKeys.length; i++) {
            if (tenders[tenderKeys[i]].isClosed) {
                closedCount++;
            }
        }

        string[] memory keys = new string[](closedCount);
        string[] memory winnerNames = new string[](closedCount);
        uint256[] memory amounts = new uint256[](closedCount);

        uint256 index = 0;
        for (uint256 i = 0; i < tenderKeys.length; i++) {
            if (tenders[tenderKeys[i]].isClosed) {
                keys[index] = tenderKeys[i];
                winnerNames[index] = bidderNames[tenders[tenderKeys[i]].winner];
                amounts[index] = tenders[tenderKeys[i]].lowestBid;
                index++;
            }
        }

        return (keys, winnerNames, amounts);
    }

    event TenderCreated(string tenderKey, uint256 baseAmount);
    event TenderClosed(string tenderKey, address winner, uint256 lowestBid);
}