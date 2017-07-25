import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

export default class Header extends Component {
	render() {
    return (
			<header class={style.header}>
				<h1>Fuel Price</h1>
        <nav>
          <Link activeClassName={style.active} href="/all">All List</Link>
          <Link activeClassName={style.active} href="/">My List</Link>
          <Link activeClassName={style.active} href="/settings">Settings</Link>
        </nav>
			</header>
		);
	}
}
