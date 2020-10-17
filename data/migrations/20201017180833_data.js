exports.up = function(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments()
        table.string("user_name",128).notNullable();
        table.string("password",128).notNullable();
        table.string("email",128).notNullable().unique()
      })
      .createTable('orders', function (table) {
        table.increments()
        table.integer("user_id",128).notNullable()
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT")
        .onUpdate("CASCADE")
        table.string("product_id",128).notNullable();
        table.integer("price",128).notNullable();
        table.string("email",128).notNullable()
        table.string("name",128).notNullable()
        table.string("img",128).notNullable()
        table.string("street",255)
        table.string("city",255)
        table.string("country",255)
        table.boolean("delivered",128)
        table.date("date_ordered")
        table.date("date_arrived")
        
      })
  };
  
  exports.down = function(knex) {
    exports.down = function(knex) {
        return knex.schema.dropTableIfExists('users')
        .dropTableIfExists("orders")
  
    };
  };