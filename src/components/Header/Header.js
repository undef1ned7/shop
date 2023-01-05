import React from "react";
import {Link} from "react-router-dom";
import './Header.css'
const Header = ()=>{
    return (
        <header>
            <h1 className={'logo'}>Shop</h1>
          <div className={'header__right'}>
              <Link to={'/'}><i class="fa-solid fa-house"></i></Link>
              <Link to={'/cart'}><i class="fa-solid fa-cart-shopping"></i></Link>
          </div>
        </header>
    );
};
export default Header;