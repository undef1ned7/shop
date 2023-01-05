import React from "react";
import './Cart.css'
const Cart = ({cart, setCart})=>{
    const deleteCart = (obj)=>{
        if(obj.count > 1){
            const idx = cart.findIndex((item)=>{
               return item.id === obj.id
            });
            cart[idx].count--;
            setCart(cart.map((item)=>{
                return item
            }))
        } else{
            setCart(cart.filter((item)=>{
                return item.id !== obj.id
            }))
        }
    };
    return(
        <section>
            <div className="container">
                {
                    cart.length === 0 ? <h2>your cart is empty</h2> : 
                    <> {
                        cart.map((item)=>{
                           return <div className="cart">
                              <h2>{item.title}</h2>
                              <div className="cart-right">
                                 <p>count: <b>{item.count}</b></p>
                                 <p>price: <b>${(item.price * item.count).toFixed(2)}</b></p>
                                 <button onClick={()=>{
                                     deleteCart(item)
                                 }}>delete</button>
                              </div>
                           </div>
                        })
                    }
                    <div><b>Total:</b> ${
                        cart.reduce((acc, rec)=>{
        return acc + (rec.count * rec.price)
                        }, 0).toFixed(2)
                    }</div></>
                }
           
            </div>
            
        </section>
    );
};
export default Cart;