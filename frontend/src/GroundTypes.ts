export const getGroundTypes: Promise<any[]> = fetch(
    "/rotmg/json/GroundTypes.json"
)
    .then((r) => r.text())
    .then((r) => JSON.parse(r)["Ground"]);
