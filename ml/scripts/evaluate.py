"""Plot training curves from YOLO results.csv.

Run from the ml/ directory:
    python scripts/evaluate.py --results models/pothole_yolo/results.csv
"""
import argparse
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

ML_ROOT = Path(__file__).resolve().parent.parent


def plot_results(csv_path: str):
    df = pd.read_csv(csv_path)
    # Strip whitespace from column names (YOLO sometimes adds spaces)
    df.columns = df.columns.str.strip()

    sns.set(style="whitegrid")
    fig, axes = plt.subplots(2, 2, figsize=(12, 12))

    # Loss curves
    ax = axes[0, 0]
    for col, label, color in [
        ("train/box_loss", "Train Box Loss", "blue"),
        ("val/box_loss", "Val Box Loss", "cyan"),
        ("train/cls_loss", "Train Class Loss", "green"),
        ("val/cls_loss", "Val Class Loss", "orange"),
        ("train/dfl_loss", "Train DFL Loss", "red"),
        ("val/dfl_loss", "Val DFL Loss", "purple"),
    ]:
        if col in df.columns:
            ax.plot(df["epoch"], df[col], label=label, color=color)
    ax.set_title("Loss Curves")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")
    ax.legend()

    # Precision & Recall
    ax = axes[0, 1]
    for col, label, color in [
        ("metrics/precision(B)", "Precision", "blue"),
        ("metrics/recall(B)", "Recall", "green"),
    ]:
        if col in df.columns:
            ax.plot(df["epoch"], df[col], label=label, color=color)
    ax.set_title("Precision & Recall")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Value")
    ax.legend()

    # mAP
    ax = axes[1, 0]
    for col, label, color in [
        ("metrics/mAP50(B)", "mAP@0.5", "red"),
        ("metrics/mAP50-95(B)", "mAP@0.5:0.95", "purple"),
    ]:
        if col in df.columns:
            ax.plot(df["epoch"], df[col], label=label, color=color)
    ax.set_title("Mean Average Precision")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Value")
    ax.legend()

    # Learning rate
    ax = axes[1, 1]
    for col, label, color in [
        ("lr/pg0", "LR pg0", "blue"),
        ("lr/pg1", "LR pg1", "green"),
        ("lr/pg2", "LR pg2", "orange"),
    ]:
        if col in df.columns:
            ax.plot(df["epoch"], df[col], label=label, color=color)
    ax.set_title("Learning Rate")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("LR")
    ax.legend()

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Plot YOLO training curves")
    default_csv = ML_ROOT / "models" / "pothole_yolo" / "results.csv"
    parser.add_argument("--results", default=str(default_csv), help="Path to results.csv")
    args = parser.parse_args()
    plot_results(args.results)
