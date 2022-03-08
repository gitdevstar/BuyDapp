import React, {Fragment} from 'react';

class AppContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fragment>
                <div className="app-container app-theme-white fixed-header">
                    <div className="app-main">
                        <div className="app-main__outer">
                            <div className="app-main__inner">
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div> 
            </Fragment> 
        );
    }
}

export default  AppContainer ;