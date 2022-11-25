export const STRUCTURES = {
  title: {
    uriBase: 'http://data.lblod.info/titles/',
    title: 'Title',
    type: 'https://say.data.gift/ns/Title https://say.data.gift/ns/ArticleContainer',
    heading: 'h3',
    translation: 'articleStructurePlugin.insert.title',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <http://test/myTestContainer>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Title https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h4 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'articleStructurePlugin.placeholder.title'
        )}</span></span>
      </h4>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  chapter: {
    uriBase: 'http://data.lblod.info/chapters/',
    title: 'Chapter',
    translation: 'articleStructurePlugin.insert.chapter',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Title>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Chapter https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h4 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'articleStructurePlugin.placeholder.chapter'
        )}</span></span>
      </h4>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  section: {
    uriBase: 'http://data.lblod.info/sections/',
    title: 'Section',
    heading: 'h5',
    translation: 'articleStructurePlugin.insert.heading',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Chapter>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Section https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h5 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'articleStructurePlugin.placeholder.section'
        )}</span></span>
      </h5>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
  },
  subsection: {
    uriBase: 'http://data.lblod.info/subsections/',
    title: 'Subsection',
    heading: 'h6',
    translation: 'articleStructurePlugin.insert.subsection',
    insertPredicate: 'https://say.data.gift/ns/body',
    shaclConstraint: `
      @prefix sh: <http://www.w3.org/ns/shacl#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix schema: <http://schema.org/> .
      schema:ArticleShape
        a sh:NodeShape  ;
        sh:targetSubjectsOf <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;
        sh:property [
          sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ;
          sh:hasValue <https://say.data.gift/ns/Section>
        ].
      `,
    template: (uri, intlService) => `
    <div 
      property="say:hasPart" 
      typeof="https://say.data.gift/ns/Subsection https://say.data.gift/ns/ArticleContainer" 
      resource="${uri}"
    >
      <h6 property="say:heading">
        <span property="eli:number" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </span>.
        <span property="ext:title"><span class="mark-highlight-manual">${intlService.t(
          'articleStructurePlugin.placeholder.subsection'
        )}</span></span>
      </h6>
      <div property="say:body" datatype='rdf:XMLLiteral'>
        <span class="mark-highlight-manual">Voer inhoud in</span>
      </div>
    </div>`,
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
          sh:hasValue <https://say.data.gift/ns/ArticleContainer>
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
