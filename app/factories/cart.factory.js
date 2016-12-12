angular
      .module('Factories')
      .factory('CartFactory',
      function () {
          var allProducts = [
              { id: 'classic', name: 'Classic Ad', price: 269.99  },
              { id: 'premium', name: 'Premium Ad', price: 394.99 },
              { id: 'standout', name: 'Standout Ad', price: 322.99 }
          ],
          cart = [],
          discounts = {},
          discountSummary = {};

          function roundUp(num, precision) {
              return Math.ceil(num * precision) / precision;
          }

          function calculatePrice(id, quantity) {
              if(discounts[id]) {
                  return discounts[id](quantity);
              }
              var product = _.findWhere(allProducts, {id: id});
              return quantity * product.price;
          }

          function groupCartById() {
              var groups = _.groupBy(cart, 'id'),
                cartTotal = 0;
              Object.keys(groups).forEach(function(key,index) {
                  var obj = {
                      price:  roundUp(calculatePrice(key, groups[key].length), 100),
                      name: groups[key][0].name,
                      quantity: groups[key].length,
                      summary: discountSummary[key]
                  };
                  cartTotal += obj.price;
                  groups[key] = obj;
              });

              return {
                  groups: groups,
                  total: roundUp(cartTotal, 100)
              };
          }

          return {
              geAllProducts: function() {
                  return allProducts;
              },
              addToCart : function(item){
                   cart.push(item);
              },
              getCart: function() {
                  var groupedCart = groupCartById();
                   return {
                       count: cart.length,
                       items: groupedCart.groups,
                       total: groupedCart.total
                   };
               },
               setDiscount: function(discount, summary) {
                   discounts = discount;
                   discountSummary = summary;
               },
               calculatePrice: calculatePrice
          };
      }
  );
