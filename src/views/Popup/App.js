import React from 'react';
import { AppBar, Button, Card, TextField } from '@material-ui/core';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import SearchIcon from '@material-ui/icons/Search';

import './App.css';

const today = timestampToDate(Date.now());

function timestampToDate(timestamp) {
  let strg = '';
  let d = new Date(parseInt(timestamp));
  strg += d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  return strg;
}
function getDate(timestamp) {
  console.log(today)
  let temp = timestampToDate(timestamp);
  if (temp == today) {
    let d = new Date(parseInt(timestamp));
    return d.getHours() + ':' + d.getMinutes()
  }
  else
    return temp;
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTxt: '',
      value: '', bookmarks: [
        { id: '1', title: 'Home Page', url: 'google.com', scroll: 200, timestamp: '1607504582702' },
        { id: '2', title: 'Home Page', url: 'https://stackoverflow.com/questions/16503879/chrome-extension-how-to-open-a-link-in-new-tab', scroll: 200, timestamp: '1607504582702' },
        { id: '2', title: 'Home Page', url: 'https://stackoverflow.com/questions/16503879/chrome-extension-how-to-open-a-link-in-new-tab', scroll: 200, timestamp: '1607504582702' },
        { id: '2', title: 'Home Page', url: 'https://stackoverflow.com/questions/16503879/chrome-extension-how-to-open-a-link-in-new-tab', scroll: 200, timestamp: '1607504582702' },
        { id: '2', title: 'Home Page', url: 'https://stackoverflow.com/questions/16503879/chrome-extension-how-to-open-a-link-in-new-tab', scroll: 200, timestamp: '1607504582702' },
        { id: '3', title: 'Home Page', url: 'https://github.com/al-caughey/Google-Meet-Attendance/blob/master/src/js/attendance.js', scroll: 200, timestamp: '1607504582702' }
      ]
    };
  }
  componentDidMount() {
    var bookmarks = this.state.bookmarks.map((obj) => {
      return { ...obj, time: getDate(obj.timestamp) }
    })
    this.setState({ bookmarks });
    setTimeout(() => {
      console.log(this.state.bookmarks);
    }, 2000)
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
    chrome.storage.sync.get(null, (result) => {
      console.log('Value currently is ', result);
      var keys = Object.keys(result);
      let bmks = [];
      keys.forEach((key) => {
        let bmk = result[key];
        bmk['timestamp'] = key;
        bmks.push(bmk);
      })
      console.log('bmks', bmks);
      this.setState({ bookmarks: bmks });
      this.setState({ value: JSON.stringify(result) })
    });
  }
  setData = () => {
    console.log('setData called');
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      console.log(tabs[0]);
      var code = `window.scrollY`;
      chrome.tabs.executeScript(tabs[0].id, { code }, (result) => {
        console.log(result);
        var timestamp = Date.now();
        chrome.storage.sync.set({ [timestamp]: { url: tabs[0].url, title: tabs[0].title, scroll: parseInt(result[0]) } }, () => {
          console.log('Value is set to ' + { url: tabs[0].url, scroll: result[0] });
          let bmks = this.state.bookmarks;
          bmks.push({ timestamp, time: getDate(timestamp), url: tabs[0].url, title: tabs[0].title, scroll: parseInt(result[0]) });
          this.setState({ bookmarks: bmks });
        });
      });
    });
  }
  getData = () => {

  }
  openPage = (data) => {
    let obj = {
      msg: 'createNewTab',
      url: data.url,
      scroll: data.scroll,
      code: `window.addEventListener('load', function(event) {
        window.scrollTo(0, ${data.scroll});
        console.log("script loaded!");
      });`
    }
    chrome.runtime.sendMessage(obj, function (response) {
      console.log(response);
    });
  }
  delete = (timestamp) => {
    console.log(timestamp);
    chrome.storage.sync.remove(timestamp, () => {
      console.log('deleted');
      let bmks = this.state.bookmarks.filter((obj) => obj.timestamp != timestamp);
      this.setState({ bookmarks: bmks });
    })
  }
  filterData = e => {
    this.setState({ searchTxt: e.target.value });
  }
  render() {
    return (
      <div className="App">
        <AppBar position="static" className="appBar">
          <span>SCROLLMARK <span style={{ fontSize: '16px' }}>v0.1</span></span>
        </AppBar>
        <div className="app-body">
          <p>
            <Button className="btn" variant="contained" color="primary" onClick={this.setData}>Add Scrollmark to current Tab</Button>
          </p>
            <div className="search-wrapper">
              <div><SearchIcon className="search-icon" /></div>
              <input className="search-inp" placeholder="Search" onChange={this.filterData} />
            </div>
          <div className="card-list">
            {this.state.bookmarks.map((obj) => {
              if (this.state.searchTxt != '' && (obj.title.toLowerCase().indexOf(this.state.searchTxt) !== -1 || obj.url.toLowerCase().indexOf(this.state.searchTxt) !== -1))
                return <Card className="card">
                  <span className="delete-icon-wrapper" onClick={() => this.delete(obj.timestamp)}><DeleteTwoToneIcon className="delete-icon" /></span>
                  <span className="timestamp-wrapper">{obj.time}</span>
                  <b>Title: </b><span className="card-title">{obj.title}</span><br />
                  <b>URL:&nbsp;</b><span className="card-url" onClick={() => this.openPage(obj)}>{obj.url}</span><br />
                  <b>Scroll: </b><span className="card-scroll">{obj.scroll}</span>
                </Card>
              else if (this.state.searchTxt == '')
                return <Card className="card">
                  <span className="delete-icon-wrapper" onClick={() => this.delete(obj.timestamp)}><DeleteTwoToneIcon className="delete-icon" /></span>
                  <span className="timestamp-wrapper">{obj.time}</span>
                  <b>Title: </b><span className="card-title">{obj.title}</span><br />
                  <b>URL:&nbsp;</b><span className="card-url" onClick={() => this.openPage(obj)}>{obj.url}</span><br />
                  <b>Scroll: </b><span className="card-scroll">{obj.scroll}</span>
                </Card>
            })}
          </div>
        </div>
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
