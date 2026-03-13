import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shop API",
      version: "1.0.0",
      description: "API документация для интернет-магазина",
    },
    servers: [
      {
        url: "http://0.0.0.0:8000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            category: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            image: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProductListPaginated: {
          type: "object",
          properties: {
            count: { type: "number" },
            next: { type: "string", nullable: true },
            previous: { type: "string", nullable: true },
            results: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
          },
        },
        UserAuthRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            role: { type: "string", enum: ["admin", "seller", "user"] },
            sellerStatus: {
              type: "string",
              enum: ["none", "pending", "approved", "rejected"],
            },
            products: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            categories: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        AdminUserInfo: {
          type: "object",
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            role: { type: "string", enum: ["admin", "seller", "user"] },
            sellerStatus: {
              type: "string",
              enum: ["none", "pending", "approved", "rejected"],
            },
            products: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            cart: { $ref: "#/components/schemas/CartResponse" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            product: { $ref: "#/components/schemas/Product" },
            qty: { type: "number" },
          },
        },
        CartResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            total: { type: "number" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            product: { $ref: "#/components/schemas/Product" },
            qty: { type: "number" },
            price: { type: "number" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                role: { type: "string" },
              },
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            total: { type: "number" },
            status: {
              type: "string",
              enum: ["new", "paid", "shipped", "completed", "cancelled"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/products": {
        get: {
          summary: "Получить список товаров (с фильтрами, сортировкой и пагинацией)",
          tags: ["Products"],
          parameters: [
            {
              name: "search",
              in: "query",
              description: "Поиск по названию и описанию",
              schema: { type: "string" },
            },
            {
              name: "category",
              in: "query",
              description: "ID категории",
              schema: { type: "string" },
            },
            {
              name: "minPrice",
              in: "query",
              schema: { type: "number" },
            },
            {
              name: "maxPrice",
              in: "query",
              schema: { type: "number" },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 12 },
            },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "price_asc",
                  "price_desc",
                  "title_asc",
                  "title_desc",
                  "createdAt_asc",
                  "createdAt_desc",
                ],
                default: "createdAt_desc",
              },
            },
          ],
          responses: {
            200: {
              description: "Список товаров с пагинацией",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ProductListPaginated",
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Создать товар",
          tags: ["Products"],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Созданный товар",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Product" },
                },
              },
            },
            400: { description: "Ошибка валидации" },
          },
        },
      },
      "/products/{id}": {
        get: {
          summary: "Получить товар по id",
          tags: ["Products"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Товар",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Product" },
                },
              },
            },
            404: { description: "Товар не найден" },
          },
        },
      },
      "/categories": {
        get: {
          summary: "Получить список категорий",
          tags: ["Categories"],
          responses: {
            200: {
              description: "Список категорий",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Создать категорию",
          tags: ["Categories"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Созданная категория",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Category" },
                },
              },
            },
            400: { description: "Ошибка валидации" },
          },
        },
      },
      "/users/register": {
        post: {
          summary: "Регистрация пользователя",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserAuthRequest" },
              },
            },
          },
          responses: {
            201: {
              description: "Пользователь зарегистрирован",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/AuthTokens" },
                      {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          username: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "Ошибка валидации или пользователь уже существует" },
          },
        },
      },
      "/users/login": {
        post: {
          summary: "Логин пользователя",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserAuthRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "Успешный логин",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/AuthTokens" },
                      {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          username: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: { description: "Неверный логин или пароль" },
          },
        },
      },
      "/users/refresh": {
        post: {
          summary: "Обновление access/refresh токенов",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Новая пара токенов",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthTokens" },
                },
              },
            },
            401: { description: "Невалидный refresh токен" },
          },
        },
      },
      "/users/logout": {
        post: {
          summary: "Выход пользователя (инвалидация refresh токена)",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Успешный выход" },
          },
        },
      },
      "/users/me": {
        get: {
          summary: "Профиль текущего пользователя",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Профиль пользователя",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserProfile" },
                },
              },
            },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/users/seller-request": {
        post: {
          summary: "Отправить запрос на роль продавца (seller)",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Запрос принят",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserProfile" },
                },
              },
            },
            400: {
              description:
                "Пользователь уже продавец или запрос уже находится в ожидании",
            },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/users": {
        get: {
          summary: "Получить список всех пользователей (только admin)",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Список пользователей с их товарами и корзиной",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/AdminUserInfo" },
                  },
                },
              },
            },
            401: { description: "Неавторизован" },
            403: { description: "Недостаточно прав (нужен admin)" },
          },
        },
      },
      "/users/{id}/seller-status": {
        patch: {
          summary: "Изменить статус заявки на продавца (только admin)",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["approved", "rejected"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Обновлённый пользователь",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminUserInfo" },
                },
              },
            },
            400: { description: "Неверный статус" },
            401: { description: "Неавторизован" },
            403: { description: "Недостаточно прав (нужен admin)" },
            404: { description: "Пользователь не найден" },
          },
        },
      },
      "/users/change-password": {
        post: {
          summary: "Смена пароля текущего пользователя",
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oldPassword", "newPassword"],
                  properties: {
                    oldPassword: { type: "string" },
                    newPassword: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Пароль успешно изменён" },
            400: { description: "Ошибка валидации или старый пароль неверен" },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/users/cart": {
        get: {
          summary: "Получить корзину текущего пользователя",
          tags: ["Cart"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Текущая корзина",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CartResponse" },
                },
              },
            },
            401: { description: "Неавторизован" },
          },
        },
        post: {
          summary: "Добавить товар в корзину / увеличить количество",
          tags: ["Cart"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId"],
                  properties: {
                    productId: { type: "string" },
                    qty: { type: "integer", minimum: 1 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Обновлённая корзина",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CartResponse" },
                },
              },
            },
            400: { description: "Ошибка валидации" },
            401: { description: "Неавторизован" },
          },
        },
        delete: {
          summary: "Удалить товар из корзины или очистить корзину",
          tags: ["Cart"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    productId: {
                      type: "string",
                      description:
                        "ID товара для удаления из корзины. Если не указан — корзина очищается полностью.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Обновлённая корзина",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CartResponse" },
                },
              },
            },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/orders": {
        post: {
          summary: "Создать заказ из корзины текущего пользователя",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          responses: {
            201: {
              description: "Заказ создан",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Order" },
                },
              },
            },
            400: { description: "Корзина пуста или ошибка данных" },
            401: { description: "Неавторизован" },
          },
        },
        get: {
          summary: "Получить список заказов",
          description:
            "Обычный пользователь получает только свои заказы, admin — все заказы.",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Список заказов",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/orders/{id}": {
        get: {
          summary: "Получить заказ по ID",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Заказ",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Order" },
                },
              },
            },
            403: {
              description:
                "Пользователь не имеет доступа к заказу (не свой заказ и не admin)",
            },
            404: { description: "Заказ не найден" },
            401: { description: "Неавторизован" },
          },
        },
      },
      "/orders/{id}/status": {
        patch: {
          summary: "Обновить статус заказа (только admin)",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "new",
                        "paid",
                        "shipped",
                        "completed",
                        "cancelled",
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Обновлённый заказ",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Order" },
                },
              },
            },
            400: { description: "Неверный статус" },
            401: { description: "Неавторизован" },
            403: { description: "Недостаточно прав (нужен admin)" },
            404: { description: "Заказ не найден" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options as any);

export default swaggerSpec;

