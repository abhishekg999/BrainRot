export const getObjects = fetch("/rotmg/json/Objects.json")
    .then((r) => r.text())
    .then((r) => JSON.parse(r));
