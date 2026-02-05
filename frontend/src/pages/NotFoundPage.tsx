import { Link } from "react-router-dom";
import { Button } from "../components/Button";

const NotFoundPage = () => (
  <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
    <h2 className="card__title">Page not found</h2>
    <p className="card__subtitle">
      The page you are looking for does not exist.
    </p>
    <Link to="/requests">
      <Button>Back to requests</Button>
    </Link>
  </div>
);

export default NotFoundPage;
