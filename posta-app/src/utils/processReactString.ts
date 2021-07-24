// https://github.com/EfogDev/react-process-string
// Copyright 2017 Efog
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

/**
 * Process a string into react components
 * @param options 
 * @returns 
 */
export function processString(options: ProcessStringOptions[]) {
    let key = 0;

    function processInputWithRegex(option: ProcessStringOptions, input: string | any[]): any {
        if (!option.fn)
            return input;

        if (!option.regex)
            return input;

        if (typeof input === 'string') {
            let regex = option.regex;
            let result = null;
            let output = [];

            while ((result = regex.exec(input)) !== null) {
                let index = result.index;
                let match = result[0];

                output.push(input.substring(0, index));
                output.push(option.fn(++key, result));

                input = input.substring(index + match.length, input.length + 1);
                regex.lastIndex = 0;
            }

            output.push(input);
            return output;
        } else if (Array.isArray(input)) {
            return input.map(chunk => processInputWithRegex(option, chunk));
        } else return input;
    }

    return function (input: any) {
        if (!options || !Array.isArray(options) || !options.length)
            return input;

        options.forEach(option => input = processInputWithRegex(option, input));

        return input;
    };
}

export interface ProcessStringOptions { regex: RegExp; fn(key: any, result: string[]): any }