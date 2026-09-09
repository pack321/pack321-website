const CASEABLE_LETTER = /\p{L}/u;

const titleCasePart = (part) => {
  let capitalizeNext = true;
  return [...part.toLocaleLowerCase("en-US")]
    .map((character) => {
      if (!CASEABLE_LETTER.test(character)) {
        capitalizeNext = character === "'" || character === "’" || character === "-";
        return character;
      }
      if (!capitalizeNext) return character;
      capitalizeNext = false;
      return character.toLocaleUpperCase("en-US");
    })
    .join("");
};

export const normalizeFamilyLastName = (submittedValue) => {
  const collapsed = String(submittedValue ?? "").trim().replace(/\s+/gu, " ");
  if (!collapsed) {
    throw Object.assign(new Error("Enter your family last name."), {
      status: 400,
      category: "family_name_required",
    });
  }
  if (collapsed.length > 80) {
    throw Object.assign(new Error("Family last name must be 80 characters or fewer."), {
      status: 400,
      category: "family_name_too_long",
    });
  }

  const letters = [...collapsed].filter((character) => CASEABLE_LETTER.test(character));
  const isUniformCase =
    letters.length > 0 &&
    (letters.every((character) => character === character.toLocaleLowerCase("en-US")) ||
      letters.every((character) => character === character.toLocaleUpperCase("en-US")));

  return isUniformCase
    ? collapsed
        .split(" ")
        .map((part) => titleCasePart(part))
        .join(" ")
    : collapsed;
};

export const familyDisplayName = (lastName) => `${lastName} Family`;
