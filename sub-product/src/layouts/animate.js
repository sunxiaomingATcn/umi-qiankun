import withRouter from 'umi/withRouter';
import { TransitionGroup, CSSTransition } from "react-transition-group";

export default withRouter(
  ({ history: {location}, ...props }) =>
    <TransitionGroup >
      <CSSTransition key={location.pathname} classNames="fade" timeout={300}>
        { props.children }
      </CSSTransition>
    </TransitionGroup>
)
