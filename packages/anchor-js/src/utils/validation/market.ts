import { InputEntry } from "../validate-input";
import marketConstant from "../../constants/market.json"

export const validateWhitelistedMarket = (market: string): InputEntry => (
    [
        () => marketConstant.hasOwnProperty(market),
        `unknown market ${market}.`
    ]
)