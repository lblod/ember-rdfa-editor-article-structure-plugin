export const STRUCTURES = [
  {
    uriBase: 'http://data.lblod.info/titles/',
    title: 'Title',
    type: 'https://say.data.gift/ns/Title',
    heading: 'h3',
    translation: 'articleStructurePlugin.insert.title',
    placeholder: 'articleStructurePlugin.placeholder.title',
  },
  {
    uriBase: 'http://data.lblod.info/chapters/',
    title: 'Chapter',
    type: 'https://say.data.gift/ns/Chapter',
    heading: 'h4',
    translation: 'articleStructurePlugin.insert.chapter',
    placeholder: 'articleStructurePlugin.placeholder.chapter',
  },
  {
    uriBase: 'http://data.lblod.info/sections/',
    title: 'Section',
    type: 'https://say.data.gift/ns/Section',
    heading: 'h5',
    translation: 'articleStructurePlugin.insert.heading',
    placeholder: 'articleStructurePlugin.placeholder.heading',
  },
  {
    uriBase: 'http://data.lblod.info/subsections/',
    title: 'Subsection',
    type: 'https://say.data.gift/ns/Subsection',
    heading: 'h6',
    translation: 'articleStructurePlugin.insert.subsection',
    placeholder: 'articleStructurePlugin.placeholder.subsection',
  },
];

export const structureTypes = STRUCTURES.map((structure) => structure.type);
