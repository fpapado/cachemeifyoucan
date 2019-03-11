import React, { useReducer } from "react";

// TODO: Route manifest

const mockInput = `1552321187716 /hello
1552321187716 /is
1552321187716 /it
1552321187716 /me
1552321187716 /hello
`;

const SetText = text => ({
  type: "SetText",
  text
});

const SetMinutes = minutes => ({
  type: "SetMinutes",
  minutes
});

const CalculateResults = () => ({
  type: "CalculateResults"
});

const reducer = (prevState, action) => {
  switch (action.type) {
    case "SetText":
      return {
        ...prevState,
        text: action.text
      };

    case "SetMinutes":
      return {
        ...prevState,
        minutes: action.minutes
      };

    case "CalculateResults":
      return {
        ...prevState,
        results: calculateResults(prevState.text, prevState.minutes)
      };

    default:
      throw Error("Unknown action type: ", action.type);
  }
};

const initState = {
  text: mockInput,
  numbers: 10,
  results: null
};

function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <div className="pa3 min-vh-100 bg-near-white sans-serif lh-copy">
      <header className="pv3 tc">
        <h1 className="f2 f1-ns mt0 mb4 mb5-ns lh-title">
          Cache me if you can
        </h1>
      </header>
      <main className="mw8 center">
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
                  value={state.text}
                  onChange={ev => dispatch(SetText(ev.target.value))}
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
                    onChange={ev => dispatch(SetMinutes(ev.target.value))}
                  />
                  <div className="f5 f4-ns">minutes</div>
                </div>
              </div>
              <button
                className="f5 f4-ns fw6 pv2 ph3 bg-blue hover-bg-dark-pink white br1 bn pointer"
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
    </div>
  );
}

// TODO: Make a type Ok, Err
function parseLines(text) {
  return text.split("\n").map(parseLine);
}

function parseLine(line) {
  return line.trim().split(" ");
}

function calculateResults(text, minutes) {
  return [{ route: "/hello", count: 2 }, { route: "/is", count: 1 }];
}

export default App;
