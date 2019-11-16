"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// strip non alpha-numeric characters so that someone searching for "Battlin' Boxer" and "battlingboxer" gets the same result
function cleanString(s) {
    return s.toLowerCase().replace(/[\W_]+/g, "");
}
exports.cleanString = cleanString;
function messageCapSlice(outString) {
    var outStrings = [];
    var MESSAGE_CAP = 2000;
    while (outString.length > MESSAGE_CAP) {
        var index = outString.slice(0, MESSAGE_CAP).lastIndexOf("\n");
        if (index === -1 || index >= MESSAGE_CAP) {
            index = outString.slice(0, MESSAGE_CAP).lastIndexOf(",");
            if (index === -1 || index >= MESSAGE_CAP) {
                index = outString.slice(0, MESSAGE_CAP).lastIndexOf(" ");
                if (index === -1 || index >= MESSAGE_CAP) {
                    index = MESSAGE_CAP - 1;
                }
            }
        }
        outStrings.push(outString.slice(0, index + 1));
        outString = outString.slice(index + 1);
    }
    outStrings.push(outString);
    return outStrings;
}
exports.messageCapSlice = messageCapSlice;
//# sourceMappingURL=util.js.map