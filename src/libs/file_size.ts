export type TFileSize = Number & {
  readableSize(this: number): string;
};

export default class FileSize extends Number implements TFileSize {
  readableSize(): string {
    const size = this.valueOf();

    let correct_size = 0,
      unit = this.decideUnit();

    switch (unit) {
      case "TB":
        correct_size = size / 1e12;
        break;
      case "GB":
        correct_size = size / 1e9;
        break;
      case "MB":
        correct_size = size / 1e6;
        break;
      case "KB":
        correct_size = size / 1e3;
        break;
      default:
        correct_size = size;
    }

    return `[${correct_size.toFixed(1)} ${unit}]`;
  }

  private decideUnit() {
    const size = this.valueOf();

    if (size < 1e6) return "KB";
    if (size < 1e9) return "MB";
    if (size < 1e12) return "GB";
    return "TB";
  }
}
