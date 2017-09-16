'use strict';

function exploreWikidataOntology(ontology) {
	switch (ontology.type) {
	case 'class': {
		const wikidataClass = ontology.wikidataClass;
		const predicateObject = `wdt:P31/wdt:P279* wd:${wikidataClass}`;
		showClassHierarchy(wikidataClass);
		showCommonProperties(predicateObject);
		showCommonStatements(predicateObject);
		break;
	}
	case 'property': {
		const wikidataProperty = ontology.wikidataProperty;
		const predicateObject = `p:${wikidataProperty} []`;
		hideClassHierarchy();
		showCommonProperties(predicateObject);
		showCommonStatements(predicateObject);
		break;
	}
	}
}

function showClassHierarchy(wikidataClass) {
	const classHierarchy = document.getElementById('classHierarchy');
	const classHierarchyIFrame = document.createElement('iframe');
	classHierarchyIFrame.src = `https://tools.wmflabs.org/wikidata-todo/tree.html?q=${wikidataClass}&rp=P279`;
	classHierarchyIFrame.id = 'classHierarchy';
	classHierarchy.replaceWith(classHierarchyIFrame);
	classHierarchyIFrame.parentElement.hidden = false;
}

function hideClassHierarchy() {
	const classHierarchy = document.getElementById('classHierarchy');
	const classHierarchyI = document.createElement('i');
	classHierarchyI.textContent = 'N/A';
	classHierarchyI.id = 'classHierarchy';
	classHierarchy.replaceWith(classHierarchyI);
	classHierarchyI.parentElement.hidden = true;
}

function showCommonProperties(predicateObject) {
	const commonProperties = document.getElementById('commonProperties');
	const commonPropertiesIFrame = document.createElement('iframe');
	const query = `
SELECT ?property ?propertyLabel ?count WITH {
  SELECT ?property (COUNT(DISTINCT ?statement) AS ?count) WHERE {
    ?item ${predicateObject};
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
	commonPropertiesIFrame.id = 'commonProperties';
	commonProperties.replaceWith(commonPropertiesIFrame);
}

function showCommonStatements(predicateObject) {
	const commonStatements = document.getElementById('commonStatements');
	const commonStatementsIFrame = document.createElement('iframe');
	const query = `
SELECT ?property ?propertyLabel ?value ?valueLabel ?count WITH {
  SELECT ?property ?value (COUNT(DISTINCT ?item) AS ?count) WHERE {
    ?item ${predicateObject};
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
	commonStatementsIFrame.id = 'commonStatements';
	commonStatements.replaceWith(commonStatementsIFrame);
}

function updateRadioChildren(form, radio) {
	for (const fieldset of form.querySelectorAll('input[type=radio] ~ fieldset')) {
		fieldset.disabled = true;
	}
	radio.parentElement.querySelector('fieldset').disabled = false;
}

document.addEventListener('DOMContentLoaded', e => {
	const mainForm = document.getElementById('mainForm');

	mainForm.addEventListener('submit', e => {
		if (document.getElementById('ontologyTypeClass').checked) {
			exploreWikidataOntology({
				type: 'class',
				wikidataClass: document.getElementById('wikidataClass').value
			});
		} else if (document.getElementById('ontologyTypeProperty').checked) {
			exploreWikidataOntology({
				type: 'property',
				wikidataProperty: document.getElementById('wikidataProperty').value
			});
		}
		e.preventDefault();
	});

	for (const radio of mainForm.querySelectorAll('input[type=radio]')) {
		radio.addEventListener('change', e => updateRadioChildren(mainForm, e.target));
	}
	updateRadioChildren(mainForm, mainForm.querySelector('input[type=radio]:checked'));
});
