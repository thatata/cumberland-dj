import React from 'react';
import './App.css';
import axios from 'axios';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick() {
        alert(this.state.value);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    }

    render() {
        return (
            <form className="form-inline my-2 my-lg-0">
                <input type="search" className="form-control mr-sm-2" value={this.state.value} onChange={this.handleChange} placeholder="Search" aria-label="Search"/>
                <button type="submit" className="btn btn-outline-dark my-2 my-sm-0" onClick={this.handleClick}>Search</button>
            </form>
        );
    }
}

class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            selected: '',
        };
    }

    componentDidMount () {
        axios.get('/test')
            .then((resp) => {
                this.setState({
                    data: resp.data,
                });
            });
    }

    dropdownSelected(value) {
        this.setState({
            data: this.state.data,
            selected: value,
        });
    }

    render() {
        let supportedTypes;
        if (this.state.data && this.state.data.types) {
            supportedTypes = this.state.data.types;
        } else {
            supportedTypes = [];
        }

        let selectedText;
        if (this.state.selected && this.state.selected !== '') {
            selectedText = this.state.selected;
        } else {
            selectedText = "Type";
        }

        return (
        <li className="nav-item dropdown">
          <a key="toggle" className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {selectedText}
          </a>
          <div key="options" className="dropdown-menu" aria-labelledby="navbarDropdown">
            {supportedTypes.length > 0 &&
                supportedTypes.map((value, index) => {
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    return <a key={index} onClick={() => this.dropdownSelected(capitalized)} className="dropdown-item" href="#">{capitalized}</a>
                })
            }
          </div>
        </li>
        );
    }
}

class NavBar extends React.Component {
    render() {
        return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded">
          <a className="navbar-brand" href="#">Cumberland DJ</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <DropDown />
            </ul>
            <SearchBar />
          </div>
        </nav>
        );
    }
}

class Queue extends React.Component {
    render() {
        return (
        <div className="table-responsive">
          <table className="table table-hover table-sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">First</th>
                  <th scope="col">Last</th>
                  <th scope="col">Handle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1</th>
                  <td>Mark</td>
                  <td>Otto</td>
                  <td>@mdo</td>
                </tr>
                <tr>
                  <th scope="row">2</th>
                  <td>Jacob</td>
                  <td>Thornton</td>
                  <td>@fat</td>
                </tr>
                <tr>
                  <th scope="row">3</th>
                  <td colspan="2">Larry the Bird</td>
                  <td>@twitter</td>
                </tr>
              </tbody>
            </table>
        </div>
        );
    }
}

class SearchPage extends React.Component {
    render() {
        return (
            <div className="container">
                <NavBar />
                <h6>Queue:</h6>
                <Queue />
                <h6>Search Results:</h6>
                <Queue />
            </div>
        );
    }
}

function App() {
  return (
    <SearchPage />
  );
}

export default App;
