import React, { useReducer, useEffect } from "react";
import { sortBy, groupBy } from "lodash-es";
import * as matchit from "matchit";

// TODO: Route manifest

const mockInput = `1552321187728 /2019
1552321187716 /2019/saskatoon
1552321187716 /2019/utsunomiya
0 /2019
1552321187716 /2019/saskatoon/omg-did-not-expect-this
`;

const mockRoutes = `'/:season/',
'/:season/:eventId',
`;

const SetSourceLines = text => ({
  type: "SetSourceLines",
  text
});

const SetRoutes = text => ({
  type: "SetRoutes",
  text
});

const SetMinutes = minutes => ({
  type: "SetMinutes",
  minutes
});

const CalculateResults = () => ({
  type: "CalculateResults"
});

// TODO: Consider storing the "processed" data, and not the raw strings here
const reducer = (prevState, action) => {
  console.log(prevState, action);
  switch (action.type) {
    case "SetSourceLines":
      return {
        ...prevState,
        sourceLines: parseSourceLines(action.text)
      };

    case "SetRoutes":
      return {
        ...prevState,
        routes: parseRoutes(action.text)
      };

    case "SetMinutes":
      return {
        ...prevState,
        minutes: parseInt(action.minutes)
      };

    case "CalculateResults":
      return {
        ...prevState,
        results: calculateResults(
          prevState.sourceLines,
          prevState.minutes,
          prevState.routes
        )
      };

    default:
      throw Error("Unknown action type: ", action.type);
  }
};

const initState = {
  sourceLines: "",
  minutes: 10,
  routes: "",
  results: null
};

function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <div className="pa3 min-vh-100 flex flex-column bg-near-white sans-serif lh-copy">
      <header className="pv3 tc mb4 mb5-ns">
        <h1 className="f2 f1-ns mt0 mb0 lh-title ttu">Cache me if you can</h1>
        <p className="f5 f4-ns lh-copy">
          A tool to help you measure the effect of cache times on requests
        </p>
      </header>
      <main className="flex-grow-1 w-100 mw8 center">
        <div className="flex flex-column">
          <section className="mb4 mb5-ns">
            <form>
              <h2 className="f3 f2-ns mt0 mb3 mb4-ns lh-title">Config</h2>
              <div className="mb3">
                <label
                  htmlFor="sourceTextarea"
                  className="db mb3 f4 f3-ns lh-title fw6"
                >
                  Source text
                </label>
                <p
                  className="mt0 mb3 f5 f4-ns lh-copy measure"
                  id="sourceTextAreaDescription"
                >
                  Input must be of the form "UNIX_TIMESTAMP ROUTE", separated by
                  newlines.
                </p>
                <textarea
                  id="sourceTextarea"
                  aria-describedby="sourceTextAreaDescription"
                  className="w-100 code mb3 pa3"
                  placeholder={mockInput}
                  rows="10"
                  onChange={ev => dispatch(SetSourceLines(ev.target.value))}
                />
              </div>
              <div className="mb3">
                <label
                  htmlFor="routeTextarea"
                  className="db mb3 f4 f3-ns lh-title fw6"
                >
                  Routes
                </label>
                <p
                  className="mt0 mb3 f5 f4-ns lh-copy measure"
                  id="routeTextareaDescription"
                >
                  Routes are used to help group URLs. They must be
                  comma-separated. If a route does not match, then the path is
                  shown verbatim.
                </p>
                <textarea
                  id="routeTextarea"
                  aria-describedby="sourceTextAreaDescription"
                  className="w-100 code mb3 pa3"
                  placeholder={mockRoutes}
                  rows="10"
                  onChange={ev => dispatch(SetRoutes(ev.target.value))}
                />
              </div>
              <div className="mb3">
                <label
                  htmlFor="cachetime"
                  className="db mb3 f4 f3-ns lh-title fw6"
                >
                  Cache time (in minutes)
                </label>
                <div className="flex items-baseline">
                  <input
                    id="cachetime"
                    className="db w4 mb3 mr2 pa2"
                    placeholder="10"
                    value={state.minutes}
                    onChange={ev => dispatch(SetMinutes(ev.target.value))}
                  />
                  <div className="f5 f4-ns">minutes</div>
                </div>
              </div>
              <button
                className="f5 f4-ns fw6 pv2 ph3 bg-dark-blue hover-bg-dark-pink white br1 bn pointer"
                onClick={ev => {
                  ev.preventDefault();
                  dispatch(CalculateResults());
                }}
              >
                Calculate
              </button>
            </form>
          </section>

          <section className="mb4">
            <h2 className="f3 f2-ns mt0 mb4 lh-title">Results</h2>
            {state.results ? (
              <>
                <h3 className="f4 f3-ns mt0 mb3 lh-title">Request Count</h3>
                <dl className="mw5 f5 f4-ns lh-copy">
                  {state.results.map(res => (
                    <div key={res.route} className="flex mb2 tl">
                      <dt>{res.route}</dt>
                      <dd className="ml-auto">{res.count}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="f5 f4-ns lh-copy">No results... yet.</p>
            )}
          </section>
        </div>
      </main>
      <footer className="mt4 mb3 mw7 center f5 tc">
        <a
          className="dark-blue"
          href="https://github.com/fpapado/cachemeifyoucan"
        >
          This... thing is open source on Github
        </a>
        <p className="mt2 mb0">
          Made with{" "}
          <span role="img" aria-label="Grinning Face With Sweat">
            😅
          </span>{" "}
          by <a className="dark-blue" href="https://fotis.xyz">Fotis Papadogeorgopoulos</a>
        </p>
      </footer>
    </div>
  );
}

// TODO: Make a type Ok, Err
function parseSourceLines(text) {
  return text
    .split("\n")
    .map(parseSourceLine)
    .filter(arr => arr.length)
    .map(([maybePosix, route]) => [parseInt(maybePosix), route])
    .map(([posix, route]) => ({ posix, route }));
}

function parseSourceLine(line) {
  return line
    .trim()
    .split(" ")
    .filter(str => !!str);
}

function parseRoutes(text) {
  return text
    .split(",")
    .map(str => str.trim())
    .map(str => matchit.parse(str));
}

const minutesToMillis = minutes => minutes * 60 * 1000;

function partitionByTime(minutes, arr) {
  let partitions = [];

  // Sort the array, get the first start/end time
  const sorted = sortBy(arr);
  let startTime = sorted[0];
  let currentPartition = [];
  let endTime = startTime + minutesToMillis(minutes);

  // Go over every time, partitioning when there's a gap
  for (const time of sorted) {
    if (time < endTime) {
      currentPartition = [...currentPartition, time];
    } else {
      // Push the current queued partition
      partitions = [...partitions, currentPartition];

      // Start a new partition
      currentPartition = [time];
      endTime = time + minutesToMillis(minutes);
    }
  }

  if (currentPartition.length > 0) {
    partitions = [...partitions, currentPartition];
  }

  return partitions;
}

function calculateResults(sourceLines, minutes, routes) {
  // TODO: Here, get the obj.route and group if it matches() a certain route, top-to-bottom
  const groupedByRoute = groupBy(sourceLines, ({ route }) => {
    const match = matchit.match(route, routes);
    // If there is a match, group by that, otherwise group verbatim
    const routeToGroupBy = match.length ? match[0].old : route;
    return routeToGroupBy;
  });
  console.log({ groupedByRoute });

  const res = Object.entries(groupedByRoute).map(
    ([route, routeAndPosixArr]) => {
      const posixArr = routeAndPosixArr.map(obj => obj.posix);
      const count = partitionByTime(minutes, posixArr).length;
      return { route, count };
    }
  );

  return res;
}

export default App;
