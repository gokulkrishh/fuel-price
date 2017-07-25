import { h, Component } from 'preact';
import fuelIcon from '../../assets/fuel-icon.svg';
import style from './style';

export default class Intro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show || false
    };
		this.hideIntro = this.hideIntro.bind(this);
  }

  componentDidMount() {
		if (!localStorage.getItem("firstTimeVisit")) {
      this.setState({show: true});
    }
  }

  hideIntro() {
    this.setState({show: false}, () => {
      localStorage.setItem("firstTimeVisit", true);
    });
  }

  render() {
    const {show} = this.state;
    if (!show) return <div/>;
    return (
      <div class={style.intro}>
        <div class={style.intro__icon}/>
        <h1>Fuel Price</h1>
        <p>Know the fuel prices throughout the India.</p>
        <span>(price might vary a little based on the petrol station)</span>
        <button onClick={this.hideIntro}>Get Started</button>
      </div>
    );
  }
}
