
export function truncateTextMiddle(startLength: number, text: string, endLength: number) {
  const realStartLength = text.length > startLength ? startLength : 0;
  const realEndLength = text.length - endLength > endLength ? endLength : 0;
  return (
    text.substring(0, realStartLength) + "..." + text.substring(text.length - realEndLength)
  );
}

/**
 * Returns an array of urls found on the string.
 * @param text 
 * @returns 
 */
export function extractLinks(text: string) {
  const retVal: string[] = [];
  for (const regex of [REGEX_PROTOCOLESS_URL, REGEX_URL]) {
    let result = null;
    while ((result = regex.exec(text)) !== null) {
      retVal.push(result[0]);
    }
  }

  return retVal;
}

export const REGEX_PROTOCOLESS_URL = /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim;
export const REGEX_URL = /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim;