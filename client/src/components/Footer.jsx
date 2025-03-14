import react from "react";

const Footer = ()=>{
    return(
        <>
        <footer className="footer">
        
        <div className="foot-container">
           <div className="f1">
              <h4 className="logo_white"><img src="assets/images/logo.png"/></h4>
              <p className="ppp">Buy quality products from this awesome website.</p>
           </div>
           <div className="f2">
              <h4 className="wh">Socials</h4>
              <ul className="f_links">
                  <li><a href="https://github.com/onkarjha" target="blank">Github</a></li> 
                 <li><a href="https://instagram.com/the_black_pepper" target="blank">Instagram</a></li>
                 <li><a href="https://facebook.com/the_black_pepper" target="blank">Facebook</a></li>
                 <li><a href="https://twitter.com/the_black_pepper" target="blank">Twitter</a></li>
                 <li><a href="https://linkedlin.com/in/the_black_pepper" target="blank">Linkedlin</a></li>
              </ul>
           </div>
           <div className="f3">
              <h4 className="wh">Links</h4>
              <ul className="f_links">
                 <li><a href="/">Home</a></li>
                 <li><a href="product.php">Products</a></li>
                 <li><a href="wishlist.php">Wishlist</a></li>
                 <li><a href="cart.php">Cart</a></li>
                 <li><a href="shop">Join Us</a></li>
              </ul>
           </div>
           <div className="f4">
              <h4 className="wh">Let's Connect</h4>
              <p className="ppp">Connect with us to get variety of spices at your fingertips.</p>
              
              <a href="#subscribe" className="btn .text-primary" target="blank">Subscribe Now</a>
           </div>
        </div>
        <div className="copyright">
           <p className="ppp upper" >Copyright&copy;<span className="today_year ppp upper"></span> | THE BLACK PEPPER</p>
        </div>
        <img src="shapes/1.png" className="shape a"/>
        <img src="shapes/2.png" className="shape b"/>
        <img src="shapes/3.png" className="shape c"/>
        <img src="shapes/4.png" className="shape d"/>
        <img src="shapes/5.png" className="shape e"/>
        <img src="shapes/6.png" className="shape f"/>
        {/* <img src="shapes/1.png" className="shape g">
        <img src="shapes/2.png" className="shape h">
        <img src="shapes/3.png" className="shape i"> */}
     </footer>
  
        </>
        
    );
}
export default Footer;