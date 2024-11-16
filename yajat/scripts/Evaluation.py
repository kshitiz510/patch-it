import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

results_csv_path = r"yajat\models\potholeDetectionYOLO6\results.csv"
df = pd.read_csv(results_csv_path)

print(df.head())

sns.set(style="whitegrid")

fig, ax = plt.subplots(2, 2, figsize=(12, 12))

ax[0, 0].plot(df['epoch'], df['train/box_loss'], label='Train Box Loss', color='blue')
ax[0, 0].plot(df['epoch'], df['val/box_loss'], label='Validation Box Loss', color='cyan')
ax[0, 0].plot(df['epoch'], df['train/cls_loss'], label='Train Class Loss', color='green')
ax[0, 0].plot(df['epoch'], df['val/cls_loss'], label='Validation Class Loss', color='orange')
ax[0, 0].plot(df['epoch'], df['train/dfl_loss'], label='Train DFL Loss', color='red')
ax[0, 0].plot(df['epoch'], df['val/dfl_loss'], label='Validation DFL Loss', color='purple')
ax[0, 0].set_title('Loss Curves (Train vs. Validation)')
ax[0, 0].set_xlabel('Epoch')
ax[0, 0].set_ylabel('Loss')
ax[0, 0].legend()

ax[0, 1].plot(df['epoch'], df['metrics/precision(B)'], label='Precision (B)', color='blue')
ax[0, 1].plot(df['epoch'], df['metrics/recall(B)'], label='Recall (B)', color='green')
ax[0, 1].set_title('Precision and Recall')
ax[0, 1].set_xlabel('Epoch')
ax[0, 1].set_ylabel('Value')
ax[0, 1].legend()

ax[1, 0].plot(df['epoch'], df['metrics/mAP50(B)'], label='mAP@0.5 (B)', color='red')
ax[1, 0].plot(df['epoch'], df['metrics/mAP50-95(B)'], label='mAP@0.5:0.95 (B)', color='purple')
ax[1, 0].set_title('Mean Average Precision (mAP)')
ax[1, 0].set_xlabel('Epoch')
ax[1, 0].set_ylabel('Value')
ax[1, 0].legend()

ax[1, 1].plot(df['epoch'], df['lr/pg0'], label='Learning Rate (pg0)', color='blue')
ax[1, 1].plot(df['epoch'], df['lr/pg1'], label='Learning Rate (pg1)', color='green')
ax[1, 1].plot(df['epoch'], df['lr/pg2'], label='Learning Rate (pg2)', color='orange')
ax[1, 1].set_title('Learning Rate Curves')
ax[1, 1].set_xlabel('Epoch')
ax[1, 1].set_ylabel('Learning Rate')
ax[1, 1].legend()


plt.tight_layout()
plt.show()
