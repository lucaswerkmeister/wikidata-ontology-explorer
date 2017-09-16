function exploreWikidataOntology(wikidataClass) {
	showClassHierarchy(wikidataClass);
	showCommonProperties(wikidataClass);
	showCommonStatements(wikidataClass);
}

function showClassHierarchy(wikidataClass) {
	const classHierarchy = document.getElementById('classHierarchy');
	emptyNode(classHierarchy);
	const classHierarchyIFrame = document.createElement('iframe');
	classHierarchyIFrame.src = `https://tools.wmflabs.org/wikidata-todo/tree.html?q=${wikidataClass}&rp=P279`;
	classHierarchy.appendChild(classHierarchyIFrame);
}

function showCommonProperties(wikidataClass) {
	const commonProperties = document.getElementById('commonProperties');
	emptyNode(commonProperties);
	const commonPropertiesIFrame = document.createElement('iframe');
	const query = `
SELECT ?property ?propertyLabel ?count WITH {
  SELECT ?property (COUNT(DISTINCT ?statement) AS ?count) WHERE {
    ?item wdt:P31/wdt:P279* wd:${wikidataClass};
          ?p ?statement.
    ?property a wikibase:Property;
              wikibase:claim ?p.
    FILTER(?property != wd:P31)
  }
  GROUP BY ?property
  ORDER BY DESC(?count)
  LIMIT 10
} AS %results WHERE {
  INCLUDE %results.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${window.navigator.languages.join(',')},en". }
}
ORDER BY DESC(?count)
`;
	commonPropertiesIFrame.src = `https://query.wikidata.org/embed.html#${encodeURIComponent(query)}`;
	commonProperties.appendChild(commonPropertiesIFrame);
}

function showCommonStatements(wikidataClass) {
	const commonStatements = document.getElementById('commonStatements');
	emptyNode(commonStatements);
	const commonStatementsIFrame = document.createElement('iframe');
	const query = `
SELECT ?property ?propertyLabel ?value ?valueLabel ?count WITH {
  SELECT ?property ?value (COUNT(DISTINCT ?item) AS ?count) WHERE {
    ?item wdt:P31/wdt:P279* wd:${wikidataClass};
          ?wdt ?value.
    ?property a wikibase:Property;
              wikibase:directClaim ?wdt.
    FILTER(?property != wd:P31)
  }
  GROUP BY ?property ?value
  ORDER BY DESC(?count)
  LIMIT 10
} AS %results WHERE {
  INCLUDE %results.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${window.navigator.languages.join(',')},en". }
}
ORDER BY DESC(?count)
`;
	commonStatementsIFrame.src = `https://query.wikidata.org/embed.html#${encodeURIComponent(query)}`;
	commonStatements.appendChild(commonStatementsIFrame);
}

function emptyNode(node) {
	while (node.firstChild)
		node.removeChild(node.firstChild);
}
