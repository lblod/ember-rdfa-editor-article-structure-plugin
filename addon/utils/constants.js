export const STRUCTURES = {
  title: {
    uriBase: 'http://data.lblod.info/titles/',
    title: 'Title',
    type: 'https://say.data.gift/ns/Title',
    heading: 'h3',
    translation: 'articleStructurePlugin.insert.title',
    placeholder: 'articleStructurePlugin.placeholder.title',
  },
  chapter: {
    uriBase: 'http://data.lblod.info/chapters/',
    title: 'Chapter',
    type: 'https://say.data.gift/ns/Chapter',
    heading: 'h4',
    translation: 'articleStructurePlugin.insert.chapter',
    placeholder: 'articleStructurePlugin.placeholder.chapter',
  },
  section: {
    uriBase: 'http://data.lblod.info/sections/',
    title: 'Section',
    type: 'https://say.data.gift/ns/Section',
    heading: 'h5',
    translation: 'articleStructurePlugin.insert.heading',
    placeholder: 'articleStructurePlugin.placeholder.heading',
  },
  subsection: {
    uriBase: 'http://data.lblod.info/subsections/',
    title: 'Subsection',
    type: 'https://say.data.gift/ns/Subsection',
    heading: 'h6',
    translation: 'articleStructurePlugin.insert.subsection',
    placeholder: 'articleStructurePlugin.placeholder.subsection',
  },
  article: {
    uriBase: 'http://data.lblod.info/artikels/',
    title: 'Article',
    translation: 'articleStructurePlugin.insert.article',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
                  sh:path <https://say.data.gift/ns/hasPart> ;
                  sh:class <http://data.vlaanderen.be/ns/besluit#Artikel>
        ];
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Chapter>
        ].
      `,
    template: (uri) => `
      <div property="say:hasPart" typeof="besluit:Artikel" resource="${uri}">
        <div property="say:heading">
          Artikel 
          <span property="eli:number" datatype="xsd:string"> 
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="say:body" datatype='rdf:XMLLiteral'>
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      </div>
    
    `,
  },
};
