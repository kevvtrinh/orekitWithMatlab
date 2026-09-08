import { readFileSync } from "node:fs";
import { avoidanceSpec as buildAvoidanceSpec, avoidanceScene as buildAvoidanceScene } from "../../src/lib/avoidanceDemo.js";

const catalog = JSON.parse(readFileSync(new URL("../../public/geography/countries.json", import.meta.url), "utf8"));
const vietnam = catalog.countries.find((country) => country.code === "VNM");

export const avoidanceSpec = () => buildAvoidanceSpec(vietnam);
export const avoidanceScene = () => buildAvoidanceScene(vietnam);
