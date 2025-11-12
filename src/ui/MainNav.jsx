import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlinePresentationChartBar,
  HiOutlineRectangleGroup,
  HiOutlineMagnifyingGlassCircle,
  HiOutlineBarsArrowDown,
  HiOutlineScale,
} from "react-icons/hi2";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const SectionTitle = styled.div`
  margin: 1.6rem 0 0.4rem;
  padding: 0 2.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-grey-500);
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
    border-radius: var(--border-radius-sm);
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
  }

  & svg {
    width: 2.2rem;
    height: 2.2rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
    flex-shrink: 0;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }

  & span small {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-grey-500);
    letter-spacing: 0.02em;
    margin-top: 0.1rem;
  }
`;

function MainNav() {
  return (
    <nav>
      <NavList>
        <li>
          <StyledNavLink to="/graphs">
            <HiOutlinePresentationChartBar />
            <span>
              Graphs Studio
              <small>TP1</small>
            </span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/trees">
            <HiOutlineRectangleGroup />
            <span>
              Trees
              <small>TP1</small>
            </span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/search">
            <HiOutlineMagnifyingGlassCircle />
            <span>
              Search
              <small>TP2</small>
            </span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/sorts">
            <HiOutlineBarsArrowDown />
            <span>
              Sorts
              <small>TP3</small>
            </span>
          </StyledNavLink>
        </li>

        <li>
          <StyledNavLink to="/compare">
            <HiOutlineScale />
            <span>
              Compare
              <small>TP3</small>
            </span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}

export default MainNav;
