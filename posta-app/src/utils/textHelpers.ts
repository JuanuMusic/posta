
export default function truncateTextMiddle(startLength: number, text: string, endLength: number) {
    const realStartLength = startLength > text.length ? startLength : 0;
    const realEndLength = text.length - endLength > endLength ? endLength : 0;
    return (
      text.substring(0, realStartLength) + "..." + text.substring(text.length - realEndLength)
    );
  }