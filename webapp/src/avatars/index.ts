const avatar00 = require("./avatar00.svg") as string;
const avatar01 = require("./avatar01.svg") as string;
const avatar02 = require("./avatar02.svg") as string;
const avatar03 = require("./avatar03.svg") as string;
const avatar04 = require("./avatar04.svg") as string;
const avatar05 = require("./avatar05.svg") as string;
const avatar06 = require("./avatar06.svg") as string;
const avatar07 = require("./avatar07.svg") as string;
const avatar08 = require("./avatar08.svg") as string;


const avatar = (name: string) => {

    switch (name) {
        case "avatar00":
            return avatar00
        case "avatar01":
            return avatar01
        case "avatar02":
            return avatar02
        case "avatar03":
            return avatar03
        case "avatar04":
            return avatar04
        case "avatar05":
            return avatar05
        case "avatar06":
            return avatar06
        case "avatar07":
            return avatar07
        case "avatar08":
            return avatar08

    }

}

export { avatar }