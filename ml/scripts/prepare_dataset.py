"""Convert a Pascal VOC pothole dataset into YOLO format and split it.

Default behavior:
- Reads source images from ml/data/train/images
- Reads Pascal VOC XML annotations from ml/data/train/labels
- Writes YOLO splits to ml/data/yolo/{train,val,test}
- Generates ml/data/yolo/data.yaml

Run from the ml/ directory:
    python scripts/prepare_dataset.py
"""

from __future__ import annotations

import argparse
import random
import shutil
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


ML_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ML_ROOT / "data" / "train"
OUTPUT_DIR = ML_ROOT / "data" / "yolo"
CLASS_NAMES = ["pothole"]


@dataclass(frozen=True)
class Sample:
    image_path: Path
    annotation_path: Path


def _find_image(images_dir: Path, stem: str) -> Path | None:
    for extension in (".png", ".jpg", ".jpeg", ".bmp", ".webp"):
        candidate = images_dir / f"{stem}{extension}"
        if candidate.exists():
            return candidate
    return None


def _parse_voc_annotation(annotation_path: Path) -> tuple[int, int, list[tuple[int, float, float, float, float]]]:
    root = ET.parse(annotation_path).getroot()

    size = root.find("size")
    if size is None:
        raise ValueError(f"Missing size node in {annotation_path.name}")

    width = int(size.findtext("width", default="0"))
    height = int(size.findtext("height", default="0"))
    if width <= 0 or height <= 0:
        raise ValueError(f"Invalid image size in {annotation_path.name}")

    boxes: list[tuple[int, float, float, float, float]] = []
    for obj in root.findall("object"):
        name = (obj.findtext("name") or "").strip().lower()
        if name not in CLASS_NAMES:
            continue

        bbox = obj.find("bndbox")
        if bbox is None:
            continue

        xmin = float(bbox.findtext("xmin", default="0"))
        ymin = float(bbox.findtext("ymin", default="0"))
        xmax = float(bbox.findtext("xmax", default="0"))
        ymax = float(bbox.findtext("ymax", default="0"))

        box_width = xmax - xmin
        box_height = ymax - ymin
        if box_width <= 0 or box_height <= 0:
            continue

        x_center = xmin + box_width / 2.0
        y_center = ymin + box_height / 2.0

        boxes.append(
            (
                0,
                x_center / width,
                y_center / height,
                box_width / width,
                box_height / height,
            )
        )

    return width, height, boxes


def _write_yolo_label(label_path: Path, boxes: list[tuple[int, float, float, float, float]]) -> None:
    label_path.parent.mkdir(parents=True, exist_ok=True)
    with label_path.open("w", encoding="utf-8") as handle:
        for class_id, x_center, y_center, box_width, box_height in boxes:
            handle.write(
                f"{class_id} {x_center:.6f} {y_center:.6f} {box_width:.6f} {box_height:.6f}\n"
            )


def _copy_split(samples: list[Sample], split_name: str, output_root: Path) -> int:
    images_out = output_root / split_name / "images"
    labels_out = output_root / split_name / "labels"
    images_out.mkdir(parents=True, exist_ok=True)
    labels_out.mkdir(parents=True, exist_ok=True)

    count = 0
    for sample in samples:
        _, _, boxes = _parse_voc_annotation(sample.annotation_path)
        if not boxes:
            continue

        shutil.copy2(sample.image_path, images_out / sample.image_path.name)
        _write_yolo_label(labels_out / f"{sample.image_path.stem}.txt", boxes)
        count += 1

    return count


def _write_data_yaml(output_root: Path) -> None:
    yaml_path = output_root / "data.yaml"
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    yaml_text = (
        f"path: {output_root.as_posix()}\n"
        "train: train/images\n"
        "val: val/images\n"
        "test: test/images\n"
        f"nc: {len(CLASS_NAMES)}\n"
        f"names: {CLASS_NAMES!r}\n"
    )
    yaml_path.write_text(yaml_text, encoding="utf-8")


def prepare_dataset(source_dir: Path = SOURCE_DIR, output_dir: Path = OUTPUT_DIR, seed: int = 42) -> None:
    images_dir = source_dir / "images"
    annotations_dir = source_dir / "labels"

    if not images_dir.exists():
        raise FileNotFoundError(f"Missing images directory: {images_dir}")
    if not annotations_dir.exists():
        raise FileNotFoundError(f"Missing labels directory: {annotations_dir}")

    xml_files = sorted(annotations_dir.glob("*.xml"))
    if not xml_files:
        raise FileNotFoundError(f"No XML annotations found in {annotations_dir}")

    samples: list[Sample] = []
    for annotation_path in xml_files:
        image_path = _find_image(images_dir, annotation_path.stem)
        if image_path is None:
            print(f"Skipping {annotation_path.name}: matching image not found")
            continue
        samples.append(Sample(image_path=image_path, annotation_path=annotation_path))

    if not samples:
        raise RuntimeError("No usable image/annotation pairs were found")

    random.Random(seed).shuffle(samples)

    total = len(samples)
    train_count = max(1, int(total * 0.8))
    val_count = max(1, int(total * 0.1))
    test_count = total - train_count - val_count

    if test_count < 1:
        test_count = 1
        if train_count > val_count:
            train_count -= 1
        else:
            val_count -= 1

    train_samples = samples[:train_count]
    val_samples = samples[train_count:train_count + val_count]
    test_samples = samples[train_count + val_count:]

    if output_dir.exists():
        shutil.rmtree(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    written_train = _copy_split(train_samples, "train", output_dir)
    written_val = _copy_split(val_samples, "val", output_dir)
    written_test = _copy_split(test_samples, "test", output_dir)
    _write_data_yaml(output_dir)

    print("Dataset prepared successfully")
    print(f"Source pairs: {total}")
    print(f"Written train: {written_train}")
    print(f"Written val:   {written_val}")
    print(f"Written test:  {written_test}")
    print(f"Output: {output_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert VOC pothole dataset to YOLO splits")
    parser.add_argument("--source", default=str(SOURCE_DIR), help="Source dataset root")
    parser.add_argument("--output", default=str(OUTPUT_DIR), help="Output YOLO dataset root")
    parser.add_argument("--seed", type=int, default=42, help="Shuffle seed")
    args = parser.parse_args()

    prepare_dataset(Path(args.source), Path(args.output), args.seed)


if __name__ == "__main__":
    main()