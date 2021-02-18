import React from 'react';
import axios from 'axios';
import './App.css';
import $ from 'jquery';
window.$ = $;
window.jQuery = $;

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
                      <input id="search-bar-input" type="search" className="form-control border-0 search-bar" placeholder="Search" value={this.state.value} onChange={this.handleChange}></input>
                      <div className="input-group-append">
                        <button type="submit" className="btn btn-link text-primary" onClick={(e) => this.handleClick(e)}><i className="fa fa-search"></i></button>
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

        let onClick;
        if (this.props.onClick) {
            onClick = this.props.onClick;
        } else {
            onClick = () => {}
        }
        return (
        <div id="queue" className="table-responsive">
          <div id="queue-table">
            <table className="table table-fixed table-hover table-sm">
              <tbody>
                {rows.length > 0 &&
                    rows.map((value, index) => {
                    return (
                    <tr key={index} onClick={() => onClick(index)}>
                      <td className="row-image">
                        <img className="img-test img-fluid" src={value.image_url} alt=""/>
                      </td>
                      <td className="row-detail">
                      {value.title &&
                        <div>
                            TITLE
                            <h6 key={value.title}>
                            {value.title}
                            {value.explicit &&
                                <div className="explicit-img">&#127348;</div>
                            }
                            </h6>
                        </div>
                      }
                      {value.artist &&
                        <div>
                            ARTIST
                            <h6 key={value.artist}>{value.artist}</h6>
                        </div>
                      }
                      {value.name &&
                        <div>
                            NAME
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
                        onClick={(trackId) => this.props.onClick(trackId)}
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
            isAuthorizing: false,
            showSpinner: false,
            playlist: '37MEntIxfNQGXLDl6hC9b3',
        });

        // add listener for authorization
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.state.isAuthorizing) {
                window.location.reload(false);
            }
        });
    }

    isAuthorizing() {
        this.setState(state => {
            state.isAuthorizing = true;
            return state;
        });
    }

    dropdownSelected(searchType) {
        this.setState(state => {
            state.navbar.selectedType = searchType;
            return state;
        });
    }

    componentDidUpdate() {
        if (this.state.results.isSearch) {
            document.getElementById('search-bar-input').blur();
            this.setState(state => {
                state.results.hideQueue = true;
                state.results.isSearch = false;
                return state;
            });
        }
    }

    async componentDidMount () {
        // make request for current playlist & supported types
        const playlistReq = axios.get('/playlist/' + this.state.playlist);
        const supportedTypesReq = axios.get('/supported-types');
        const authorizeUrlReq = axios.get('/get-authorization-url')

        try {
            const [playlistData, supportedTypesData, authorizedUrlData] = await axios.all([playlistReq, supportedTypesReq, authorizeUrlReq]);
            this.setState(state => {
                state.authUrl = authorizedUrlData.data;
                state.queue.data = playlistData.data;
                state.navbar.types = supportedTypesData.data.types;
                return state;
            });
        } catch (errors) {
            alert('error! ' + errors);
        }
    }

    async search(queryString) {
        if (!this.state.navbar.selectedType) {
            alert('Need to set type!');
            return;
        } else if (!queryString) {
            alert('Your search is empty!');
            return;
        }

        this.setState(state => {
            state.showSpinner = true;
            return state;
        });

        const url = ['/search/', this.state.navbar.selectedType.toLowerCase(), '/', queryString].join('');
        try {
            const searchData = await axios.get(url);
            this.setState(state => {
                state.results.query = queryString;
                state.results.data = searchData.data;
                state.results.isSearch = true;
                state.showSpinner = false;
                return state;
            });
        } catch (errors) {
            alert('Error! ' + errors);
            this.setState(state => {
                state.showSpinner = false;
                return state;
            });
        }
    }

    async addTrack(trackId) {
        if (trackId < 0 || trackId >= this.state.results.data.rows.length ||
            !this.state.results.data || !this.state.results.data.rows) {
            alert('Invalid track id or no search results!');
            return;
        }

        const trackUri = this.state.results.data.rows[trackId].uri;
        var trackExists = false;
        this.state.queue.data.rows.forEach((row) => {
            if (trackUri === row.uri) {
                alert('Track already exists in the queue!')
                trackExists = true;
            }
        });

        if (trackExists) return;
        this.setState(state => {
            state.showSpinner = true;
            return state;
        });

        const url = ['/add/', this.state.playlist, '/', trackUri].join('');
        try {
            const addTrackResp = await axios.get(url);
            this.setState(state => {
                state.queue.data = addTrackResp.data;
                state.results.query = '';
                state.results.data = [];
                state.results.isSearch = false;
                state.results.hideQueue = false;
                state.showSpinner = false;
                return state;
            });
            $("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
                $("#success-alert").slideUp(1000);
            });
        } catch (errors) {
            alert('Error! ' + errors);
            this.setState(state => {
                state.showSpinner = false;
                return state;
            });
        }
    }

    render() {
        return (
            <div className="container" style={{opacity: this.state.showSpinner ? 0.5 : 1}}>
                <NavBar
                    data={this.state.navbar}
                    dropdownSelected={(searchType) => this.dropdownSelected(searchType)}
                    onClick={(query, searchType) => this.search(query, searchType)}
                />
                {this.state.authUrl &&
                    <a className="btn btn-secondary" href={this.state.authUrl} onClick={() => this.isAuthorizing()} target="_blank" rel="noreferrer">Login to Spotify</a>
                }
                {!this.state.authUrl &&
                <div className="row">
                    <div className="spinner-border" style={{visibility: this.state.showSpinner ? 'visible' : 'hidden'}} role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <img id="playlist-image" className="img-fluid" src={this.state.queue.data.image_url} alt=""/>
                    <div className="song-info">
                        PLAYLIST
                        <h6>{this.state.queue.data.name}</h6>
                        NOW PLAYING
                        <h6>now playing</h6>
                        UP NEXT
                        <h6>up next</h6>
                    </div>
                    <div class="alert alert-success" id="success-alert">
                      <button type="button" class="close" data-dismiss="alert">x</button>
                      Track added to the queue!
                    </div>
                    {!this.state.results.hideQueue &&
                    <Queue
                        data={this.state.queue.data}
                    />
                    }
                </div>
                }
                <SearchResults
                    query={this.state.results.query}
                    data={this.state.results.data}
                    onClick={(trackId) => this.addTrack(trackId)}
                />
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
