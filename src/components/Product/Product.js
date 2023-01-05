import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate} from 'react-router-dom';
import './Product.css'

const Product = ({buyProduct}) => {
    const params = useParams();
    const navigate = useNavigate()
    const [product, setProduct] = useState({});
    useEffect(()=>{
axios(`https://fakestoreapi.com/products/${params.id}`)
  .then(({data})=> setProduct(data))
    }, [])
    return (
        <section>
            {
                JSON.stringify(product) === '{}' ?
                 <div className="preloader">
                <div class="lds-ring">
                     <div></div>
                     <div></div>
                     <div></div>
                     <div></div>
                      </div>
                    </div>:  <div className="container">
            <div className="product">
           <img className={'product-img'} src={product.image} alt=""/>
           <div  className="product-right">
               <h2>{product.title}</h2>
               <p>{product.description}</p>
               <h3>${product.price}</h3>
               <button  onClick={()=>{
                   buyProduct(product)
               }}>buy</button>
               <button className="back" onClick={()=>{
                    navigate(-1)
               
               }}><i class="fa-solid fa-circle-arrow-left"></i></button>
           </div>
        </div>
            </div>
            }
           
      
        </section>
    );
};
export default Product;