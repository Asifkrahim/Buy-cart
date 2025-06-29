
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, IndianRupee } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://sheetdb.io/api/v1/4vw9w9ecdost2');
      console.log('API Response:', response.data);
      
      // Transform the data to correctly map the fields
      const transformedProducts = response.data.map((item: any) => ({
        id: item.id || `product-${Math.random()}`,
        name: item.item || 'Unnamed Product', // Use 'item' field as product name
        price: parseFloat(item.price) || 0,
        description: '', // Keep description empty since it was the image URL
        image: item.description || '', // Map description to image since it contains image URLs
        category: 'General'
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary animate-pulse">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center glow-effect">
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">BuyCart</h1>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowCart(!showCart)}
            className="relative hover:glow-effect transition-all duration-300"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 cart-badge bg-primary text-primary-foreground">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Grid */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-primary mb-8">Featured Products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="product-card bg-card border-border overflow-hidden">
                  <CardHeader className="p-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <CardTitle className="text-lg text-card-foreground mb-2">
                      {product.name}
                    </CardTitle>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="w-5 h-5 mr-1" />
                        <span>{product.price.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <Button
                        onClick={() => addToCart(product)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground hover:glow-effect transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shopping Cart Sidebar */}
          {showCart && (
            <div className="lg:w-96">
              <Card className="sticky top-24 bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-card-foreground">
                    Shopping Cart
                    <Badge variant="secondary">{getTotalItems()} items</Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-secondary rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-secondary-foreground">{item.name}</h4>
                            <div className="flex items-center text-primary font-bold">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              <span>{item.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <span className="w-8 text-center font-medium text-secondary-foreground">
                              {item.quantity}
                            </span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 p-0 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-card-foreground">Total:</span>
                          <div className="flex items-center text-primary">
                            <IndianRupee className="w-5 h-5 mr-1" />
                            <span>{getTotalPrice().toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground glow-effect">
                          Checkout
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
