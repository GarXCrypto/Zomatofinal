import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = "http://localhost:3000"; 
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [food_list, setFoodList] = useState([]);

    
    const saveToken = (newToken) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        if (token) {
            try {
                await axios.post(`${url}/cart/add`, { itemId }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (error) {
                console.error("Error adding to cart:", error.response?.data || error.message);
            }
        }
    };

    
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }));
        if (token) {
            try {
                await axios.post(`${url}/cart/remove`, { itemId }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (error) {
                console.error("Error removing from cart:", error.response?.data || error.message);
            }
        }
    };

    
    const getTotalCartAmount = () => {
        return Object.keys(cartItems).reduce((total, itemId) => {
            let item = food_list.find((product) => product._id === itemId);
            return total + (item ? item.price * cartItems[itemId] : 0);
        }, 0);
    };

    
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/food/list`);
            setFoodList(response.data.data);
        } catch (error) {
            console.error("Error fetching food list:", error.response?.data || error.message);
        }
    };

    
    const loadCartData = async () => {
        if (token) {
            try {
                const response = await axios.post(`${url}/cart/get`, {}, { headers: { Authorization: `Bearer ${token}` } });
                setCartItems(response.data.cartData);
            } catch (error) {
                console.error("Error loading cart data:", error.response?.data || error.message);
            }
        }
    };

    
    useEffect(() => {
        fetchFoodList();
        if (token) {
            loadCartData();
        }
    }, [token]);

    return (
        <StoreContext.Provider value={{ 
            food_list, 
            cartItems, 
            setCartItems, 
            addToCart, 
            removeFromCart, 
            getTotalCartAmount, 
            url, 
            token, 
            setToken: saveToken 
        }}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
