import { productDetails } from "./data";
import { DataUtil, Query, DataManager, Predicate } from "@syncfusion/ej2-data";
import {SortParam, GetProductsArgs, CreateProductArgs, UpdateProductArgs, ProductDetails, DeleteProductArgs, FilterBlock} from './types'

DataUtil.serverTimezoneOffset = 0;

const resolvers = {
  Query: {
    /* Main query used by the grid (supports paging, sorting, filtering, searching. */ 
    getProducts: (_parent: unknown, { datamanager }: GetProductsArgs) => {
        let products = [...productDetails];
        const query = new Query();
        /*------------------------ 1. Filtering-----------------------------------*/
        const performFiltering = (filterString:string) => {
          const parsed = JSON.parse(filterString);

            /**
            * The parsed filter can be an array or a single object.
            * We normalize it here so we always work on the first element.
            */
          const predicateCollection = Array.isArray(parsed) ? parsed[0] : parsed;

          /* If no valid predicate structure exists, return the original query unchanged. */
          if (!predicateCollection || !Array.isArray(predicateCollection.predicates) || predicateCollection.predicates.length === 0) {
            return query;
          }
          
          /* Determines whether multiple predicates should be combined using AND / OR. */ 
          const condition = (predicateCollection.condition || 'and').toLowerCase();
          const ignoreCase = predicateCollection.ignoreCase !== undefined ? !!predicateCollection.ignoreCase : true;

          /*This variable will accumulate the full predicate chain*/
          let combinedPredicate: Predicate | null = null;

          
          /**
           * Loop through each predicate and convert it into Syncfusion Predicate objects.
           * Supports nested (complex) filter groups through recursive processing.
           */
          predicateCollection.predicates.forEach((p:any) => {
            if (p.isComplex && Array.isArray(p.predicates)) {
              /* Handle nested predicates via recursive helper. */
              const nested = buildNestedPredicate(p, ignoreCase);
              if (nested) {
                combinedPredicate = combinedPredicate
                  ? (condition === 'or' ? combinedPredicate.or(nested) : combinedPredicate.and(nested))
                  : nested;
              }
              return;
            }

            /* Create a simple (single field) predicate. */
            const singlePredicate = new Predicate(p.field, p.operator, p.value, ignoreCase);

            /* Merge predicate into the chain using AND/OR. */
            combinedPredicate = combinedPredicate
              ? (condition === 'or' ? combinedPredicate.or(singlePredicate) : combinedPredicate.and(singlePredicate))
              : singlePredicate;
          });

          /* Apply the final combined predicate to the Syncfusion Query object. */
          if (combinedPredicate) {
            query.where(combinedPredicate);
          }
          return query;
        };
        
        /**
         * Builds a nested Predicate structure from complex filter conditions.
         * This function is called recursively to handle multi-level filter logic.
         * (e.g., AND/OR combinations inside other AND/OR blocks).
         *
         * @param block - A complex filter object containing nested predicates.
         * @param ignoreCase - Whether string comparisons should ignore case.
         * @returns A merged Predicate representing the entire nested filter block.
         */

        function buildNestedPredicate(block : FilterBlock, ignoreCase :boolean) {
          /* Determine whether this block uses "and" or "or" to merge its child predicates.*/
          const condition = (block.condition || 'and').toLowerCase();
            
          /* Will store the final combined Predicate after processing all nested items. */
          let mergedPredicate : Predicate | null = null;
          
          /**
           * Loop through each predicate entry within the current block.
           * Each entry can be a simple predicate or another nested (complex) block.
          */
          block.predicates.forEach((p:any) => {
            let node;
            if (p.isComplex && Array.isArray(p.predicates)) {
              node = buildNestedPredicate(p, ignoreCase);
            } else {
              node = new Predicate(p.field, p.operator, p.value, ignoreCase);
            }
            if (node) {
              mergedPredicate  = mergedPredicate 
                ? (condition === 'or' ? mergedPredicate .or(node) : mergedPredicate .and(node))
                : node;
            }
          });

          return mergedPredicate ;
        }

        /*----------- 2. Searching------------------------------------*/
        const performSearching = (searchParam : string) => {
          const { fields, key } = JSON.parse(searchParam)[0];
          query.search(key, fields);
        }

        /*-----------------3. Sorting-----------------------------------*/
      const performSorting = (sorted:SortParam[]|string) => {
          for (let i = 0; i < sorted.length; i++) {
            const { name, direction } = sorted[i];
            query.sortBy(name, direction);
          }
        }

      /* Apply all operations */
      if (datamanager.where) {
        performFiltering(datamanager.where);
      }
      if (datamanager.search) {
        performSearching(datamanager.search);
      }
      if (datamanager.sorted) {
        performSorting(datamanager.sorted);
      }

      /* Execute filtering/sorting/search first. */
      const filteredData = new DataManager(products).executeLocal(query);
      /* Total count after filtering */
      const count = filteredData.length;

      /*-------------------- 4. Paging----------------------------------*/
      let result = filteredData;

      if (datamanager.take !== undefined) {
        const skip = datamanager.skip || 0;
        const take = datamanager.take;

        query.page(skip / take + 1, take);
        result = new DataManager(filteredData).executeLocal(query);
      }
      return {
        result,
        count
      };
    },
   
    /* Query to get a single product by ID. */
    getProductById: ( _parent: unknown, { datamanager }: GetProductsArgs ) => {
      let id = null;
      if (datamanager && datamanager.params) {
        try {
          const paramsObj = JSON.parse(datamanager.params);
          id = paramsObj.id;
        } catch (e) {
          console.error('Failed to parse params:', datamanager.params);
        }
      }

      if (!id) return null;
      const product = productDetails.find((p:any) => p.productId === id);
      return product || null;
    }

  },

  Mutation: { 
    /**
     * Create a new product.
     *
     * @param _parent - Unused, kept for GraphQL resolver signature consistency.
     * @param args - Arguments containing the `value` payload for the new product.
     * @returns The newly created product object.
     */
    createProduct: (_parent: unknown, { value }: CreateProductArgs) => {
      const newProduct = value;
      
      /* Add to in-memory store. */
      productDetails.push(newProduct);
      
      /* Return the created entity. */
      return newProduct;
    },

    /**
     * Update an existing product by key.
     * @param args - Arguments containing `key`, optional `keyColumn`, and `value` (partial update).
     * @returns The updated product object.
     *
     * Behavior:
     * - Defaults `keyColumn` to "productId" if not provided.
     * - Finds the product using the provided key + keyColumn.
     * - Performs a shallow merge (Object.assign) to update fields.
     * 
     * Caution:
     * - `Object.assign` mutates the found object. If immutability is required,
     *   consider replacing the item in the array with a new object instead.
     */

    updateProduct: (_parent: unknown, { key, keyColumn = "productId", value }: UpdateProductArgs):ProductDetails => {  
      /* Locate the product by dynamic key column (coerce to string for robust comparison). */
      const product = productDetails.find((p:ProductDetails) => String(p[keyColumn]) === String(key));
      if (!product) throw new Error("Product not found");
      
      /* Merge the incoming partial fields into the existing product. */
      Object.assign(product, value);

      return product;
    },

    
    /**
     * Delete an existing product by key.
     * @param args - Arguments containing `key` and optional `keyColumn`.
     * @returns The deleted product object (commonly useful for confirmations/audits).
     *
     * Behavior:
     * - Finds the index of the matching product.
     * - Removes it from the in-memory array using `splice`.
     * - Returns the removed entity.
     */  
    deleteProduct: (_parent: unknown, { key, keyColumn = 'productId' }:DeleteProductArgs) => {
      /* Find the index by comparing the specified key column. */
      const idx = productDetails.findIndex((p:ProductDetails) => String(p[keyColumn]) === String(key));
      if (idx === -1) throw new Error('Product not found');
      
      /* Remove and capture the deleted product. */
      const [deleted] = productDetails.splice(idx, 1);
      return deleted;
    }

  }
};

export default resolvers;