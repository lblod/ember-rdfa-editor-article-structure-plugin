export const STRUCTURES = [
  {
    uriBase: 'http://data.lblod.info/titles/',
    title: 'Title',
    type: 'https://say.data.gift/ns/Title',
    heading: 'h3',
    translation: 'insert.title',
  },
  {
    uriBase: 'http://data.lblod.info/chapters/',
    title: 'Chapter',
    type: 'https://say.data.gift/ns/Chapter',
    heading: 'h4',
    translation: 'insert.chapter',
  },
  {
    uriBase: 'http://data.lblod.info/sections/',
    title: 'Section',
    type: 'https://say.data.gift/ns/Section',
    heading: 'h5',
    translation: 'insert.heading',
  },
  {
    uriBase: 'http://data.lblod.info/subsections/',
    title: 'Subsection',
    type: 'https://say.data.gift/ns/Subsection',
    heading: 'h6',
    translation: 'insert.subsection',
  },
];

export const structureTypes = STRUCTURES.map((structure) => structure.type);
