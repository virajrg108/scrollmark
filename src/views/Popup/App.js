import React from 'react';
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }
  componentDidMount() {
    chrome.tabs.query({}, function (tabs) {
      console.log(tabs);
    });
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      console.log(tabs[0].id);
      var code = `window.pageYOffset`;
      chrome.tabs.executeScript(tabs[0].id, { code }, function (result) {
        console.log(result);
      });
    });
  }
  setData = () => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      console.log(tabs[0]);
      var code = `window.pageYOffset`;
      chrome.tabs.executeScript(tabs[0].id, { code }, (result) => {
        console.log(result);
        chrome.storage.sync.set({ 'page1': { url: tabs[0].url, scroll: result[0] } }, () => {
          console.log('Value is set to ' + { url: tabs[0].url, scroll: result[0] });
          this.setState({ value: tabs[0].url, scroll: result[0] });
        });
      });
    });

    chrome.storage.sync.set({ 'gnameg': 'JohnDoe' }, () => {
      console.log('Value is set to ' + 'JohnDoe');
    });
  }
  getData = () => {
    chrome.storage.sync.get(null, (result) => {
      console.log('Value currently is ' + JSON.stringify(result));
      this.setState({ value: JSON.stringify(result) })
    });
  }
  openPage = () => {
    let obj = {
      msg: 'createNewTab',
      url: this.state.value,
      scroll: this.state.scroll,
      code: `window.addEventListener('load', function(event) {
        window.scrollTo(0, ${this.state.scroll});
        console.log("script loaded!");
      });`
    }
    chrome.runtime.sendMessage(obj, function(response) {
      console.log(response);
    });
  }
  render() {
    return (
      <div className="App">
        <p>Popup page</p>
        <p>
          <button onClick={this.setData}>Set</button>
          <button onClick={this.getData}>Get</button>
            The stored value is :
            <div target="_blank" onClick={this.openPage}>{this.state.value}</div>
            Edit <code>src/views/Popup/App.js</code> and save.\
            {this.state.scroll}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
          </a>

      </div>
    );
  }
  // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  //   console.log(response.farewell);
  // });
  // chrome.storage.sync.set({ 'name': 'JohnDoe' }, function () {
  //   console.log('Value is set to ' + 'JohnDoe');
  // });
  // chrome.storage.sync.get(['name'], function (result) {
  //   console.log('Value currently is ' + result.key);
  // });
}

export default App;
