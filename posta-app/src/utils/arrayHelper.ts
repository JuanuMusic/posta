export default {
    range(start: number, end: number, step: number) {
        var range = [];
        var typeofStart = typeof start;
        var typeofEnd = typeof end;

        if (step === 0) {
            throw TypeError("Step cannot be zero.");
        }

        if (end < start) {
            step = -step;
        }

        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }


        return range;
    }
};