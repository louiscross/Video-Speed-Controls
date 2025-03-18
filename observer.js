class Observer {
  watchElements(queries) {
    const summaryQueries = [];
    const observerOriginalQueries = [];

    queries.forEach((query) => {
      for (let element of query.elements) {
        const q = {
          element: element,
        };

        if (query.elementAttributes)
          q.elementAttributes = query.elementAttributes;

        summaryQueries.push(q);
        observerOriginalQueries.push(query);
      }
    });

    new MutationSummary({
      callback: (summaries) => {
        for (let i = 0; i < summaries.length; i++) {
          const summary = summaries[i];
          const queryCallback = observerOriginalQueries[i].onElement;

          if (summary.attributeChanged) {
            for (const [attr, elements] of Object.entries(
              summary.attributeChanged
            )) {
              for (const element of elements) {
                queryCallback(element, attr, false);
              }
            }
          }

          for (const element of summary.added) {
            queryCallback(element, "", false);
          }

          if (observerOriginalQueries[i].reparenting) {
            for (const element of summary.reparented) {
              queryCallback(element, "", true);
            }
          }
        }
      },
      queries: summaryQueries,
    });
  }

  observeTextContentElement(element, callback) {
    const observer = new MutationObserver(callback);
    observer.observe(element, {
      characterData: false,
      childList: true,
      attributes: false,
    });
    return observer;
  }

  observeElement(element, callback, options = {}) {
    const observer = new MutationObserver(callback);
    observer.observe(element, options);
    return observer;
  }
}

const observer = new Observer();
