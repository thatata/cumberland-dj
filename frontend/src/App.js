import React from 'react';
import './App.css';
import axios from 'axios';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    }

    handleClick(event) {
        // don't refresh
        event.preventDefault();
        this.props.onClick(this.state.value);
    }

    render() {
        return (
            <div>
                <form>
                  <div className="search-bar rounded-pill shadow-sm">
                    <div className="input-group">
                      <input id="search-bar-input" type="search" className="form-control border-0 search-bar" placeholder="Search" value={this.state.value} onChange={this.handleChange} onfocus="blur();"></input>
                      <div class="input-group-append">
                        <button type="submit" className="btn btn-link text-primary" onClick={(e) => this.handleClick(e)}><i class="fa fa-search"></i></button>
                      </div>
                    </div>
                  </div>
                </form>
            </div>
        );
    }
}

class DropDown extends React.Component {
    render() {
        let typeText;
        if (this.props.searchType && this.props.searchType !== '') {
            typeText = this.props.searchType;
        } else {
            typeText = "Type";
        }
        return (
        <li className="nav-item dropdown">
          <div key="toggle" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {typeText}
          </div>
          <div key="options" className="dropdown-menu" aria-labelledby="navbarDropdown">
            {this.props.data.types.length > 0 &&
                this.props.data.types.map((value, index) => {
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    return <div key={index} onClick={() => this.props.onClick(capitalized)} className="dropdown-item">{capitalized}</div>
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
          <div className="navbar-brand">Cumberland DJ</div>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <DropDown
                data={this.props.data}
                searchType={this.props.data.selectedType}
                onClick={(searchType) => this.props.dropdownSelected(searchType)}
              />
            </ul>
            <SearchBar
                onClick={(query) => this.props.onClick(query)}
            />
          </div>
        </nav>
        );
    }
}

class Queue extends React.Component {
    render() {
        let rows;
        if (this.props.data && this.props.data.rows) {
            rows = this.props.data.rows;
        } else {
            rows = [];
        }
        return (
        <div id="queue" className="table-responsive">
          <div id="queue-table">
            <table className="table table-fixed table-hover table-sm">
              <tbody>
                {rows.length > 0 &&
                    rows.map((value, index) => {
                    return (
                    <tr key={index}>
                      <td className="row-image">
                        <img className="img-test img-fluid" src={value.image_url} alt=""/>
                      </td>
                      <td className="row-detail">
                      {value.title &&
                        <div>
                            <h7 key='title'>TITLE</h7>
                            <h6 key={value.title}>{value.title}</h6>
                        </div>
                      }
                      {value.artist &&
                        <div>
                            <h7 key='artist'>ARTIST</h7>
                            <h6 key={value.artist}>{value.artist}</h6>
                        </div>
                      }
                      {value.name &&
                        <div>
                            <h7 key='name'>NAME</h7>
                            <h6 key={value.name}>{value.name}</h6>
                        </div>
                      }
                      </td>
                    </tr>
                    );
                    })
                }
              </tbody>
            </table>
          </div>
        </div>
        );
    }
}

class SearchResults extends React.Component {
    render() {
        if (this.props.query) {
            return (
                <div className="row">
                    <div className="search-results">
                        <h6>Search results for &quot;{this.props.query}&quot;</h6>
                    </div>
                    <Queue
                        data={this.props.data}
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}

class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({
            queue: {
                data: [],
            },
            navbar: {
                types: [],
                selectedType: '',
            },
            results: {
                query: '',
                data: [],
            },
            loading: false,
        });
    }

    dropdownSelected(searchType) {
        this.setState({
            queue: {
                data: this.state.queue.data,
            },
            navbar: {
                types: this.state.navbar.types,
                selectedType: searchType,
            },
            results: {
                query: this.state.results.query,
                data: this.state.results.data,
                hideQueue: this.state.results.hideQueue,
            },
            loading: this.state.loading,
        });
    }

    componentDidUpdate() {
        if (this.state.results.isSearch) {
            document.getElementById('search-bar-input').blur();
            document.getElementsByClassName('search-results')[0].scrollIntoView({behavior: 'smooth'});
            this.setState({
                queue: {
                    data: this.state.queue.data,
                },
                navbar: {
                    types: this.state.navbar.types,
                    selectedType: this.state.navbar.selectedType,
                },
                results: {
                    query: this.state.results.query,
                    data: this.state.results.data,
                    hideQueue: true,
                },
                loading: this.state.loading,
            });
        }
    }

    componentDidMount () {
        // make request for current playlist & supported types
        const playlistReq = axios.get('/playlist/5CndgBCSao2SMmq3Dj9o6S');
        const supportedTypesReq = axios.get('/supported-types');

        axios.all([playlistReq, supportedTypesReq]).then(axios.spread((...responses) => {
            const playlistResp = responses[0]
            const supportedTypesResp = responses[1]

            this.setState({
                queue: {
                    data: playlistResp.data,
                },
                navbar: {
                    types: supportedTypesResp.data.types,
                    selectedType: '',
                },
                results: {
                    query: '',
                    data: [],
                },
                loading: false,
            });
        })).catch(errors => {
            alert('error! ' + errors);
        });
    }

    changeSpinner() {
        const loading = this.state.loading;
        const opacity = loading ? 1 : 0.5;
        const visibility = loading ? 'hidden' : 'visible';

        document.getElementsByClassName('row')[0].style.opacity = opacity;
        document.getElementsByClassName('spinner-border')[0].style.visibility = visibility;

        this.setState({
            queue: {
                data: this.state.queue.data,
            },
            navbar: {
                types: this.state.navbar.types,
                selectedType: this.state.navbar.selectedType,
            },
            results: {
                query: this.state.results.query,
                data: this.state.results.data,
            },
            loading: !loading,
        });
    }

    search(queryString) {
        if (!this.state.navbar.selectedType) {
            alert('Need to set type!');
            return;
        } else if (!queryString) {
            alert('Your search is empty!');
            return;
        }
        this.changeSpinner();
        const url = ['/search/', this.state.navbar.selectedType.toLowerCase(), '/', queryString].join('');
        axios.get(url).then((resp) => {
            this.changeSpinner();
            this.setState({
                queue: {
                    data: this.state.queue.data,
                },
                navbar: {
                    types: this.state.navbar.types,
                    selectedType: this.state.navbar.selectedType,
                },
                results: {
                    query: queryString,
                    data: resp.data,
                    isSearch: true,
                },
            });
        }).catch(errors => {
            console.log(errors);
            alert('Error! ' + errors);
            this.changeSpinner();
        });
    }

    render() {
        return (
            <div className="container">
                <NavBar
                    data={this.state.navbar}
                    dropdownSelected={(searchType) => this.dropdownSelected(searchType)}
                    onClick={(query, searchType) => this.search(query, searchType)}
                />
                <div className="row">
                    <Spinner />
                    <img id="playlist-image" className="img-fluid" src={this.state.queue.data.image_url} alt=""/>
                    <div className="song-info">
                        <h7>PLAYLIST</h7>
                        <h6>{this.state.queue.data.name}</h6>
                        <h7>NOW PLAYING</h7>
                        <h6>now playing</h6>
                        <h7>UP NEXT</h7>
                        <h6>up next</h6>
                    </div>
                    {!this.state.results.hideQueue &&
                    <Queue
                        loading={this.state.loading}
                        data={this.state.queue.data}
                    />
                    }
                </div>
                <SearchResults
                    query={this.state.results.query}
                    data={this.state.results.data}
                />
            </div>
        );
    }
}

class Spinner extends React.Component {
    render() {
        return (
            <div className="spinner-border" style={{visibility: this.props.hidden}} role="status">
              <span className="sr-only">Loading...</span>
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
