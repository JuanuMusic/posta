
export function truncateTextMiddle(startLength: number, text: string, endLength: number) {
    const realStartLength = text.length > startLength ? startLength : 0;
    const realEndLength = text.length - endLength > endLength ? endLength : 0;
    return (
      text.substring(0, realStartLength) + "..." + text.substring(text.length - realEndLength)
    );
  }

  export function linkfy(text: string) {
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
  }