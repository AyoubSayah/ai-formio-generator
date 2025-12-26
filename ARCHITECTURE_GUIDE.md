# Software Architecture Guide: Hexagonal, DDD & Modern Patterns

> A comprehensive guide to modern software architecture patterns with focus on Hexagonal Architecture, Domain-Driven Design, and their implementation in NestJS and modern frontends.

---

## Table of Contents

1. [Hexagonal Architecture (Ports & Adapters)](#hexagonal-architecture)
2. [Domain-Driven Design (DDD)](#domain-driven-design)
3. [Implementation in NestJS](#nestjs-implementation)
4. [Modular Architecture Comparison](#modular-vs-hexagonal)
5. [Frontend Architecture Patterns](#frontend-architecture)
6. [Best Practices 2025](#best-practices-2025)
7. [Real-World Examples](#real-world-examples)

---

# Hexagonal Architecture (Ports & Adapters)

## What is Hexagonal Architecture?

**Created by:** Alistair Cockburn (2005)

**Core Principle:** Isolate the core business logic from external concerns (UI, databases, APIs, frameworks).

### Key Concepts

```
┌─────────────────────────────────────────────────┐
│              External Adapters                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ REST │  │GraphQL│ │ CLI  │  │ gRPC │       │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘       │
│      │         │          │         │           │
│      └─────────┴──────────┴─────────┘           │
│                    │                             │
│           ┌────────▼────────┐                   │
│           │   Driving Ports │ (Input)           │
│           │   (Interfaces)  │                   │
│           └────────┬────────┘                   │
│                    │                             │
│      ┌─────────────▼──────────────┐             │
│      │                             │             │
│      │      DOMAIN (CORE)          │             │
│      │   - Business Logic          │             │
│      │   - Domain Entities         │             │
│      │   - Use Cases               │             │
│      │   - Domain Services         │             │
│      │                             │             │
│      └─────────────┬──────────────┘             │
│                    │                             │
│           ┌────────▼────────┐                   │
│           │   Driven Ports  │ (Output)          │
│           │   (Interfaces)  │                   │
│           └────────┬────────┘                   │
│                    │                             │
│      ┌─────────────┴──────────────┐             │
│      │         │          │        │             │
│  ┌───▼──┐  ┌──▼───┐  ┌──▼───┐ ┌─▼────┐        │
│  │PostgreSQL MongoDB│ │Redis │ │S3/API│        │
│  └──────┘  └──────┘  └──────┘ └──────┘        │
│              Driven Adapters                    │
└─────────────────────────────────────────────────┘
```

### The Three Layers

#### 1. **Domain (Core/Hexagon)**
- **What:** Pure business logic, no framework dependencies
- **Contains:**
  - Entities (business objects)
  - Value Objects
  - Domain Services
  - Use Cases / Application Services
  - Domain Events
- **Rules:**
  - No dependencies on external layers
  - Framework-agnostic
  - Testable in isolation

#### 2. **Ports (Interfaces)**
- **Driving Ports (Input):** How the outside world talks to your app
  - Use case interfaces
  - Command/Query handlers
  - Service interfaces
- **Driven Ports (Output):** How your app talks to the outside world
  - Repository interfaces
  - Email sender interfaces
  - External API interfaces

#### 3. **Adapters (Implementations)**
- **Driving Adapters (Input):**
  - REST Controllers
  - GraphQL Resolvers
  - CLI Commands
  - Message Queue Consumers
- **Driven Adapters (Output):**
  - Database Repositories (TypeORM, Prisma)
  - Email Services (SendGrid, AWS SES)
  - Cache Services (Redis)
  - External APIs

---

## Benefits of Hexagonal Architecture

### ✅ Advantages

| Benefit | Description | Impact |
|---------|-------------|--------|
| **Testability** | Core logic has zero dependencies | 10x faster unit tests |
| **Flexibility** | Swap databases/frameworks easily | Reduce tech debt |
| **Maintainability** | Clear separation of concerns | Easier onboarding |
| **Framework Independence** | Not locked to NestJS/Express | Future-proof |
| **Multiple Interfaces** | REST + GraphQL + gRPC simultaneously | Business flexibility |

### ❌ Disadvantages

| Challenge | Description | Mitigation |
|-----------|-------------|-----------|
| **Initial Complexity** | More files and abstractions | Use scaffolding tools |
| **Learning Curve** | Team needs training | Invest in documentation |
| **Over-engineering** | Overkill for simple CRUD | Use for complex domains |
| **Boilerplate** | More interfaces and mappers | Code generation |

---

# Domain-Driven Design (DDD)

## What is DDD?

**Created by:** Eric Evans (2003)

**Core Principle:** Model software to match the business domain, using ubiquitous language shared between developers and domain experts.

---

## DDD Strategic Patterns

### 1. Bounded Contexts

**Definition:** A boundary within which a domain model is defined and applicable.

**Example: E-Commerce System**

```
┌─────────────────────────────────────────────────┐
│                 E-Commerce System                │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────┐   │
│  │  Sales Context  │    │ Shipping Context │   │
│  │                 │    │                  │   │
│  │  - Order        │    │ - Shipment       │   │
│  │  - Product      │    │ - Package        │   │
│  │  - Customer     │    │ - Address        │   │
│  │  - Price        │    │ - Tracking       │   │
│  └─────────────────┘    └──────────────────┘   │
│           │                       │              │
│           └───────────┬───────────┘              │
│                       │                          │
│           ┌───────────▼───────────┐              │
│           │  Inventory Context    │              │
│           │                       │              │
│           │  - Stock              │              │
│           │  - Warehouse          │              │
│           │  - Product            │              │
│           └───────────────────────┘              │
└─────────────────────────────────────────────────┘
```

**Key Point:** "Product" means different things in each context:
- **Sales:** Product with price, description, images
- **Shipping:** Product with weight, dimensions
- **Inventory:** Product with SKU, stock quantity

### 2. Ubiquitous Language

**Definition:** Common vocabulary used by both developers and business stakeholders.

**Bad Example:**
```typescript
// Technical jargon
class DataRecord {
  items: ItemData[]
  processStatus: number
}
```

**Good Example:**
```typescript
// Business language
class Order {
  lineItems: OrderLineItem[]
  status: OrderStatus // 'pending' | 'confirmed' | 'shipped'
}
```

### 3. Context Mapping

**Relationship patterns between bounded contexts:**

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **Shared Kernel** | Shared code between contexts | Small, stable overlap |
| **Customer-Supplier** | Upstream/downstream relationship | One team depends on another |
| **Anti-Corruption Layer** | Translate between models | Protect from legacy system |
| **Published Language** | Standard format (JSON, XML) | Public APIs |

---

## DDD Tactical Patterns

### 1. Entities

**Definition:** Objects with unique identity that persists over time.

**Characteristics:**
- Has unique ID
- Mutable state
- Identity matters more than attributes

**Example:**
```typescript
// Entity: User
class User {
  constructor(
    private readonly id: UserId,  // Value Object
    private email: Email,          // Value Object
    private name: string
  ) {}

  changeEmail(newEmail: Email): void {
    // Business rule: Email must be verified
    if (!newEmail.isVerified()) {
      throw new Error('Email must be verified')
    }
    this.email = newEmail
  }

  getId(): UserId {
    return this.id
  }
}

// Two users with same name are different if IDs differ
const user1 = new User(UserId.create(), new Email('john@example.com'), 'John')
const user2 = new User(UserId.create(), new Email('john@example.com'), 'John')
console.log(user1.equals(user2)) // false (different IDs)
```

### 2. Value Objects

**Definition:** Objects defined by their attributes, not identity.

**Characteristics:**
- Immutable
- No unique ID
- Equality based on values
- Can be shared

**Example:**
```typescript
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    this.validate()
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Amount cannot be negative')
    }
    if (!['USD', 'EUR', 'GBP'].includes(this.currency)) {
      throw new Error('Invalid currency')
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount &&
           this.currency === other.currency
  }
}

// Two Money objects with same values are equal
const price1 = new Money(100, 'USD')
const price2 = new Money(100, 'USD')
console.log(price1.equals(price2)) // true
```

### 3. Aggregates

**Definition:** Cluster of entities and value objects treated as a single unit.

**Rules:**
- One entity is the Aggregate Root
- External objects can only reference the root
- Root enforces invariants
- Transactions operate on one aggregate

**Example:**
```typescript
// Aggregate Root: Order
class Order {
  private id: OrderId
  private customerId: CustomerId
  private items: OrderItem[] = []  // Entities within aggregate
  private status: OrderStatus
  private total: Money

  addItem(product: Product, quantity: number): void {
    // Enforce invariant: max 10 items
    if (this.items.length >= 10) {
      throw new Error('Maximum 10 items per order')
    }

    const item = new OrderItem(product, quantity)
    this.items.push(item)
    this.recalculateTotal()
  }

  removeItem(itemId: OrderItemId): void {
    this.items = this.items.filter(item => !item.id.equals(itemId))
    this.recalculateTotal()
  }

  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum.add(item.totalPrice()),
      Money.zero('USD')
    )
  }

  // Only Order (root) can confirm, not individual items
  confirm(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot confirm empty order')
    }
    this.status = OrderStatus.CONFIRMED
  }
}

// ❌ BAD: External code shouldn't manipulate items directly
// order.items[0].quantity = 5

// ✅ GOOD: Go through aggregate root
order.addItem(product, 5)
```

### 4. Domain Services

**Definition:** Business logic that doesn't naturally fit in an entity or value object.

**When to use:**
- Operation involves multiple aggregates
- Stateless operation
- Domain logic not belonging to one entity

**Example:**
```typescript
// Domain Service: Transfer money between accounts
class MoneyTransferService {
  transfer(
    from: BankAccount,
    to: BankAccount,
    amount: Money
  ): void {
    // Business rule: Check daily transfer limit
    if (from.hasExceededDailyLimit(amount)) {
      throw new Error('Daily transfer limit exceeded')
    }

    // Business rule: Sufficient balance
    if (!from.hasSufficientBalance(amount)) {
      throw new Error('Insufficient balance')
    }

    from.withdraw(amount)
    to.deposit(amount)

    // Domain event
    this.eventBus.publish(
      new MoneyTransferred(from.id, to.id, amount)
    )
  }
}
```

### 5. Repositories

**Definition:** Interface for accessing aggregates, abstracts data access.

**Example:**
```typescript
// Port (Interface) - in Domain layer
interface UserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: UserId): Promise<void>
}

// Adapter (Implementation) - in Infrastructure layer
class TypeOrmUserRepository implements UserRepository {
  constructor(
    private readonly repository: Repository<UserEntity>
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value }
    })
    return entity ? this.toDomain(entity) : null
  }

  async save(user: User): Promise<void> {
    const entity = this.toEntity(user)
    await this.repository.save(entity)
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      new UserId(entity.id),
      new Email(entity.email),
      entity.name
    )
  }

  private toEntity(user: User): UserEntity {
    return {
      id: user.getId().value,
      email: user.getEmail().value,
      name: user.getName()
    }
  }
}
```

### 6. Domain Events

**Definition:** Something that happened in the domain that domain experts care about.

**Characteristics:**
- Past tense naming (OrderPlaced, UserRegistered)
- Immutable
- Contain relevant data
- Can trigger other processes

**Example:**
```typescript
// Domain Event
class OrderPlaced {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly total: Money,
    public readonly occurredAt: Date
  ) {}
}

// In Aggregate
class Order {
  place(): void {
    this.status = OrderStatus.PLACED

    // Raise domain event
    this.addDomainEvent(
      new OrderPlaced(
        this.id,
        this.customerId,
        this.total,
        new Date()
      )
    )
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event)
  }
}

// Event Handler (different bounded context)
class SendOrderConfirmationHandler {
  handle(event: OrderPlaced): void {
    // Send email to customer
    this.emailService.send(
      event.customerId,
      'Order Confirmation',
      `Your order ${event.orderId} has been placed`
    )
  }
}
```

---

# NestJS Implementation

## Hexagonal Architecture in NestJS

### Project Structure

```
src/
├── modules/
│   └── orders/
│       ├── domain/                    # CORE (Hexagon)
│       │   ├── entities/
│       │   │   ├── order.entity.ts
│       │   │   └── order-item.entity.ts
│       │   ├── value-objects/
│       │   │   ├── order-id.vo.ts
│       │   │   ├── money.vo.ts
│       │   │   └── order-status.vo.ts
│       │   ├── services/
│       │   │   └── order-pricing.service.ts
│       │   ├── events/
│       │   │   └── order-placed.event.ts
│       │   └── exceptions/
│       │       └── order.exceptions.ts
│       │
│       ├── application/                # USE CASES
│       │   ├── ports/                 # Interfaces
│       │   │   ├── in/                # Driving Ports
│       │   │   │   ├── place-order.use-case.ts
│       │   │   │   └── get-order.query.ts
│       │   │   └── out/               # Driven Ports
│       │   │       ├── order.repository.ts
│       │   │       ├── payment.gateway.ts
│       │   │       └── email.service.ts
│       │   ├── use-cases/
│       │   │   ├── place-order.handler.ts
│       │   │   └── cancel-order.handler.ts
│       │   └── dto/
│       │       ├── place-order.dto.ts
│       │       └── order.response.dto.ts
│       │
│       └── infrastructure/             # ADAPTERS
│           ├── adapters/
│           │   ├── in/                # Driving Adapters
│           │   │   ├── rest/
│           │   │   │   └── order.controller.ts
│           │   │   └── graphql/
│           │   │       └── order.resolver.ts
│           │   └── out/               # Driven Adapters
│           │       ├── persistence/
│           │       │   ├── typeorm-order.repository.ts
│           │       │   └── order.entity.orm.ts
│           │       ├── payment/
│           │       │   └── stripe-payment.gateway.ts
│           │       └── email/
│           │           └── sendgrid-email.service.ts
│           └── order.module.ts
│
└── shared/
    ├── domain/
    │   ├── entity.base.ts
    │   ├── value-object.base.ts
    │   └── aggregate-root.base.ts
    └── infrastructure/
        └── database/
            └── typeorm.config.ts
```

---

## Code Examples

### 1. Domain Layer (Core)

**Entity:**
```typescript
// src/modules/orders/domain/entities/order.entity.ts
import { AggregateRoot } from '@shared/domain/aggregate-root.base'

export class Order extends AggregateRoot {
  private id: OrderId
  private customerId: CustomerId
  private items: OrderItem[]
  private status: OrderStatus
  private total: Money

  private constructor(props: OrderProps) {
    super()
    this.id = props.id
    this.customerId = props.customerId
    this.items = props.items
    this.status = props.status
    this.total = props.total
  }

  // Factory method
  static create(customerId: CustomerId): Order {
    const order = new Order({
      id: OrderId.generate(),
      customerId,
      items: [],
      status: OrderStatus.PENDING,
      total: Money.zero('USD')
    })

    order.addDomainEvent(
      new OrderCreated(order.id, customerId)
    )

    return order
  }

  // Business logic
  addItem(product: Product, quantity: number): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new OrderNotModifiableException()
    }

    const item = OrderItem.create(product, quantity)
    this.items.push(item)
    this.recalculateTotal()
  }

  place(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderException()
    }

    this.status = OrderStatus.PLACED
    this.addDomainEvent(
      new OrderPlaced(this.id, this.total)
    )
  }

  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum.add(item.getTotalPrice()),
      Money.zero('USD')
    )
  }

  // Getters
  getId(): OrderId { return this.id }
  getTotal(): Money { return this.total }
  getStatus(): OrderStatus { return this.status }
}
```

**Value Object:**
```typescript
// src/modules/orders/domain/value-objects/money.vo.ts
import { ValueObject } from '@shared/domain/value-object.base'

interface MoneyProps {
  amount: number
  currency: string
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props)
    this.validate()
  }

  static create(amount: number, currency: string): Money {
    return new Money({ amount, currency })
  }

  static zero(currency: string): Money {
    return new Money({ amount: 0, currency })
  }

  private validate(): void {
    if (this.props.amount < 0) {
      throw new Error('Amount cannot be negative')
    }
  }

  add(other: Money): Money {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot add different currencies')
    }
    return Money.create(
      this.props.amount + other.props.amount,
      this.props.currency
    )
  }

  getAmount(): number {
    return this.props.amount
  }

  getCurrency(): string {
    return this.props.currency
  }
}
```

### 2. Application Layer (Use Cases)

**Port (Interface):**
```typescript
// src/modules/orders/application/ports/in/place-order.use-case.ts
export interface PlaceOrderUseCase {
  execute(command: PlaceOrderCommand): Promise<OrderId>
}

export class PlaceOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: {
      productId: string
      quantity: number
    }[]
  ) {}
}
```

**Use Case Handler:**
```typescript
// src/modules/orders/application/use-cases/place-order.handler.ts
import { Injectable } from '@nestjs/common'
import { PlaceOrderUseCase, PlaceOrderCommand } from '../ports/in/place-order.use-case'
import { OrderRepository } from '../ports/out/order.repository'
import { ProductRepository } from '../ports/out/product.repository'

@Injectable()
export class PlaceOrderHandler implements PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(command: PlaceOrderCommand): Promise<OrderId> {
    // 1. Create order
    const customerId = new CustomerId(command.customerId)
    const order = Order.create(customerId)

    // 2. Add items
    for (const item of command.items) {
      const product = await this.productRepository.findById(
        new ProductId(item.productId)
      )
      if (!product) {
        throw new ProductNotFoundException(item.productId)
      }
      order.addItem(product, item.quantity)
    }

    // 3. Place order
    order.place()

    // 4. Save (will publish domain events)
    await this.orderRepository.save(order)

    return order.getId()
  }
}
```

### 3. Infrastructure Layer (Adapters)

**REST Controller (Driving Adapter):**
```typescript
// src/modules/orders/infrastructure/adapters/in/rest/order.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { PlaceOrderUseCase } from '@modules/orders/application/ports/in/place-order.use-case'
import { PlaceOrderDto } from './dto/place-order.dto'

@Controller('orders')
export class OrderController {
  constructor(
    private readonly placeOrderUseCase: PlaceOrderUseCase
  ) {}

  @Post()
  async placeOrder(@Body() dto: PlaceOrderDto) {
    const command = new PlaceOrderCommand(
      dto.customerId,
      dto.items
    )

    const orderId = await this.placeOrderUseCase.execute(command)

    return {
      orderId: orderId.value,
      message: 'Order placed successfully'
    }
  }
}
```

**Repository (Driven Adapter):**
```typescript
// src/modules/orders/infrastructure/adapters/out/persistence/typeorm-order.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderRepository } from '@modules/orders/application/ports/out/order.repository'
import { Order } from '@modules/orders/domain/entities/order.entity'
import { OrderOrmEntity } from './order.entity.orm'

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>
  ) {}

  async save(order: Order): Promise<void> {
    const ormEntity = this.toOrmEntity(order)
    await this.repository.save(ormEntity)

    // Publish domain events
    order.getDomainEvents().forEach(event => {
      this.eventBus.publish(event)
    })
    order.clearDomainEvents()
  }

  async findById(id: OrderId): Promise<Order | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['items']
    })

    return ormEntity ? this.toDomain(ormEntity) : null
  }

  private toDomain(ormEntity: OrderOrmEntity): Order {
    // Map ORM entity to domain entity
    const items = ormEntity.items.map(item =>
      OrderItem.reconstitute({
        id: new OrderItemId(item.id),
        productId: new ProductId(item.productId),
        quantity: item.quantity,
        price: Money.create(item.price, item.currency)
      })
    )

    return Order.reconstitute({
      id: new OrderId(ormEntity.id),
      customerId: new CustomerId(ormEntity.customerId),
      items,
      status: new OrderStatus(ormEntity.status),
      total: Money.create(ormEntity.total, ormEntity.currency)
    })
  }

  private toOrmEntity(order: Order): OrderOrmEntity {
    // Map domain entity to ORM entity
    return {
      id: order.getId().value,
      customerId: order.getCustomerId().value,
      status: order.getStatus().value,
      total: order.getTotal().getAmount(),
      currency: order.getTotal().getCurrency(),
      items: order.getItems().map(item => ({
        id: item.getId().value,
        productId: item.getProductId().value,
        quantity: item.getQuantity(),
        price: item.getPrice().getAmount(),
        currency: item.getPrice().getCurrency()
      }))
    }
  }
}
```

**Module Configuration:**
```typescript
// src/modules/orders/infrastructure/order.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderOrmEntity } from './adapters/out/persistence/order.entity.orm'
import { OrderController } from './adapters/in/rest/order.controller'
import { PlaceOrderHandler } from '../application/use-cases/place-order.handler'
import { TypeOrmOrderRepository } from './adapters/out/persistence/typeorm-order.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderOrmEntity])
  ],
  controllers: [
    OrderController
  ],
  providers: [
    // Use Case Handlers
    PlaceOrderHandler,

    // Provide implementations for interfaces
    {
      provide: 'OrderRepository',
      useClass: TypeOrmOrderRepository
    },
    {
      provide: 'PlaceOrderUseCase',
      useExisting: PlaceOrderHandler
    }
  ]
})
export class OrderModule {}
```

---

# Modular vs Hexagonal Architecture

## Comparison

### Simple Modular Architecture (Traditional NestJS)

**Structure:**
```
src/
├── modules/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── dto/
│   │   └── entities/
│   │       └── user.entity.ts
│   └── orders/
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       └── ...
```

**Code Example:**
```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    await this.usersRepository.save(user)
    await this.emailService.sendWelcomeEmail(user.email)
    return user
  }
}
```

### Hexagonal Architecture

**Structure:**
```
src/
├── modules/
│   └── users/
│       ├── domain/           # Business logic
│       ├── application/      # Use cases
│       │   ├── ports/
│       │   └── use-cases/
│       └── infrastructure/   # Adapters
│           └── adapters/
```

**Code Example:**
```typescript
// application/use-cases/create-user.handler.ts
@Injectable()
export class CreateUserHandler {
  constructor(
    private userRepository: UserRepository,  // Interface
    private emailService: EmailService       // Interface
  ) {}

  async execute(command: CreateUserCommand): Promise<UserId> {
    const user = User.create(command.email, command.name)
    await this.userRepository.save(user)

    user.getDomainEvents().forEach(event => {
      if (event instanceof UserCreated) {
        this.emailService.sendWelcomeEmail(event.email)
      }
    })

    return user.getId()
  }
}
```

---

## When to Use Each

### Use Modular Architecture When:

✅ **CRUD-heavy applications**
- Blog platforms
- Admin panels
- Simple REST APIs

✅ **Small to medium projects**
- MVPs
- Prototypes
- Internal tools

✅ **Limited team experience**
- Junior developers
- Tight deadlines
- Limited DDD knowledge

### Use Hexagonal Architecture When:

✅ **Complex business logic**
- E-commerce platforms
- Financial systems
- Booking/Reservation systems

✅ **Multiple interfaces**
- REST + GraphQL + gRPC
- Web + Mobile + Desktop

✅ **Long-term maintenance**
- 5+ year projects
- Growing teams
- Evolving requirements

✅ **Testing critical**
- High test coverage needed
- Compliance requirements
- Mission-critical systems

---

## Migration Path

### Phase 1: Add Interfaces
```typescript
// Before
class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>
  ) {}
}

// After - Add interface
interface OrderRepository {
  save(order: Order): Promise<void>
}

class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>
  ) {}
}
```

### Phase 2: Extract Domain Logic
```typescript
// Before - In service
async placeOrder(dto: PlaceOrderDto) {
  const order = new Order()
  order.items = dto.items
  order.total = dto.items.reduce((sum, i) => sum + i.price, 0)
  await this.repo.save(order)
}

// After - In domain entity
class Order {
  place(): void {
    this.validateItems()
    this.calculateTotal()
    this.addDomainEvent(new OrderPlaced(this.id))
  }
}
```

### Phase 3: Introduce Use Cases
```typescript
// Create application layer
class PlaceOrderHandler {
  async execute(command: PlaceOrderCommand) {
    const order = Order.create(command.customerId)
    command.items.forEach(item => order.addItem(item))
    order.place()
    await this.repository.save(order)
  }
}
```

---

# Frontend Architecture Patterns

## Modern Frontend Architecture (2025)

### 1. Feature-Sliced Design (FSD)

**Structure:**
```
src/
├── app/                  # App initialization
│   ├── providers/
│   ├── router/
│   └── main.ts
│
├── pages/                # Route pages
│   ├── home/
│   ├── orders/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   └── products/
│
├── widgets/              # Composite UI blocks
│   ├── header/
│   ├── order-summary/
│   └── product-list/
│
├── features/             # User interactions
│   ├── place-order/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   ├── add-to-cart/
│   └── auth/
│
├── entities/             # Business entities
│   ├── order/
│   │   ├── model/
│   │   ├── ui/
│   │   └── api/
│   ├── product/
│   └── user/
│
└── shared/               # Reusable code
    ├── ui/              # UI kit
    ├── lib/             # Utilities
    ├── api/             # API client
    └── config/
```

**Example:**
```typescript
// entities/order/model/order.ts
export interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
}

export class OrderModel {
  constructor(private order: Order) {}

  canBeCancelled(): boolean {
    return this.order.status === 'pending'
  }

  getTotalWithTax(): number {
    return this.order.total * 1.2
  }
}

// features/place-order/model/place-order.store.ts
import { defineStore } from 'pinia'
import { placeOrderApi } from '../api/place-order.api'

export const usePlaceOrderStore = defineStore('place-order', {
  state: () => ({
    loading: false,
    error: null
  }),

  actions: {
    async placeOrder(items: CartItem[]) {
      this.loading = true
      try {
        const orderId = await placeOrderApi(items)
        return orderId
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// features/place-order/ui/PlaceOrderButton.vue
<template>
  <button @click="handleClick" :disabled="store.loading">
    {{ store.loading ? 'Placing...' : 'Place Order' }}
  </button>
</template>

<script setup lang="ts">
import { usePlaceOrderStore } from '../model/place-order.store'
import { useCartStore } from '@entities/cart'

const store = usePlaceOrderStore()
const cartStore = useCartStore()

const handleClick = async () => {
  await store.placeOrder(cartStore.items)
  cartStore.clear()
}
</script>
```

### 2. Domain-Driven Frontend

**Principles:**
- Mirror backend bounded contexts
- Use ubiquitous language in code
- Separate domain logic from UI

**Example:**
```typescript
// domain/orders/Order.ts
export class Order {
  constructor(
    private readonly id: OrderId,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.Draft) {
      throw new Error('Cannot modify submitted order')
    }
    this.items.push(item)
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order')
    }
    this.status = OrderStatus.Submitted
  }

  getTotalPrice(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.totalPrice),
      Money.zero()
    )
  }
}

// ui/OrderForm.vue
<script setup lang="ts">
import { Order, OrderItem } from '@/domain/orders'

const order = ref(Order.createDraft())

const addItem = (productId: string, quantity: number) => {
  try {
    const item = OrderItem.create(productId, quantity)
    order.value.addItem(item)
  } catch (error) {
    toast.error(error.message)
  }
}

const submit = () => {
  try {
    order.value.submit()
    orderApi.save(order.value)
  } catch (error) {
    toast.error(error.message)
  }
}
</script>
```

### 3. Composition Pattern (Vue 3 / React)

**Composables (Vue 3):**
```typescript
// composables/useOrder.ts
export function useOrder(orderId: string) {
  const order = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    try {
      order.value = await orderApi.getById(orderId)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  const addItem = (item: OrderItem) => {
    if (!order.value) return
    order.value.addItem(item)
  }

  const submit = async () => {
    if (!order.value) return
    order.value.submit()
    await orderApi.update(order.value)
  }

  onMounted(load)

  return {
    order: readonly(order),
    loading: readonly(loading),
    error: readonly(error),
    addItem,
    submit
  }
}

// Component usage
<script setup lang="ts">
const { order, loading, addItem, submit } = useOrder('123')
</script>
```

**Hooks (React):**
```typescript
// hooks/useOrder.ts
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    orderApi.getById(orderId)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId])

  const addItem = useCallback((item: OrderItem) => {
    setOrder(prev => {
      if (!prev) return prev
      prev.addItem(item)
      return { ...prev }
    })
  }, [])

  return { order, loading, addItem }
}
```

### 4. State Management Patterns

**Pinia (Vue 3) - Modular Stores:**
```typescript
// stores/orders/orders.store.ts
export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as Order[],
    currentOrder: null as Order | null,
    filters: {
      status: null,
      dateFrom: null
    }
  }),

  getters: {
    activeOrders: (state) =>
      state.orders.filter(o => o.status === 'active'),

    totalValue: (state) =>
      state.orders.reduce((sum, o) => sum + o.total, 0)
  },

  actions: {
    async fetchOrders() {
      this.orders = await orderApi.getAll(this.filters)
    },

    async createOrder(items: OrderItem[]) {
      const order = Order.create(items)
      const saved = await orderApi.save(order)
      this.orders.push(saved)
      return saved
    }
  }
})
```

**Zustand (React) - Simple State:**
```typescript
// stores/useOrderStore.ts
export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],

  fetchOrders: async () => {
    const orders = await orderApi.getAll()
    set({ orders })
  },

  createOrder: async (items: OrderItem[]) => {
    const order = Order.create(items)
    const saved = await orderApi.save(order)
    set(state => ({ orders: [...state.orders, saved] }))
    return saved
  }
}))
```

---

# Best Practices 2025

## Backend Best Practices

### 1. **Dependency Injection**
```typescript
// ✅ GOOD - Depend on abstractions
class PlaceOrderHandler {
  constructor(
    private orderRepo: OrderRepository,      // Interface
    private paymentGateway: PaymentGateway  // Interface
  ) {}
}

// ❌ BAD - Depend on concrete implementations
class PlaceOrderHandler {
  constructor(
    private orderRepo: TypeOrmOrderRepository,
    private paymentGateway: StripeGateway
  ) {}
}
```

### 2. **CQRS (Command Query Responsibility Segregation)**
```typescript
// Commands - Write operations
class PlaceOrderCommand {
  constructor(
    public customerId: string,
    public items: OrderItem[]
  ) {}
}

class PlaceOrderHandler {
  async execute(command: PlaceOrderCommand): Promise<OrderId> {
    // Write to database
    const order = Order.create(command.customerId)
    await this.orderRepo.save(order)
    return order.id
  }
}

// Queries - Read operations
class GetOrderQuery {
  constructor(public orderId: string) {}
}

class GetOrderHandler {
  async execute(query: GetOrderQuery): Promise<OrderDto> {
    // Read from read model (could be different DB)
    return await this.orderReadModel.findById(query.orderId)
  }
}
```

### 3. **Event Sourcing (Optional)**
```typescript
// Store events instead of current state
class OrderPlaced {
  constructor(
    public orderId: string,
    public customerId: string,
    public total: number,
    public timestamp: Date
  ) {}
}

class OrderEventStore {
  async append(event: DomainEvent): Promise<void> {
    await this.eventRepo.save({
      aggregateId: event.orderId,
      type: event.constructor.name,
      data: event,
      version: await this.getNextVersion(event.orderId)
    })
  }

  async loadEvents(orderId: string): Promise<DomainEvent[]> {
    return await this.eventRepo.findByAggregateId(orderId)
  }
}

// Rebuild aggregate from events
class Order {
  static fromEvents(events: DomainEvent[]): Order {
    const order = new Order()
    events.forEach(event => order.apply(event))
    return order
  }

  private apply(event: DomainEvent): void {
    if (event instanceof OrderPlaced) {
      this.status = 'placed'
      this.total = event.total
    }
  }
}
```

### 4. **API Versioning**
```typescript
// URL versioning
@Controller('v1/orders')
export class OrdersV1Controller {}

@Controller('v2/orders')
export class OrdersV2Controller {}

// Header versioning
@Controller('orders')
export class OrdersController {
  @Get()
  @Version('1')
  findAllV1() {}

  @Get()
  @Version('2')
  findAllV2() {}
}
```

### 5. **Validation Pipeline**
```typescript
// DTO validation
class PlaceOrderDto {
  @IsUUID()
  customerId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}

// Domain validation
class Order {
  place(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderException()
    }
    if (!this.hasValidAddress()) {
      throw new InvalidAddressException()
    }
  }
}
```

## Frontend Best Practices

### 1. **TypeScript Strict Mode**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. **Error Boundaries (React) / Error Handling (Vue)**
```typescript
// React
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    logError(error)
    this.setState({ hasError: true })
  }
}

// Vue 3
app.config.errorHandler = (err, instance, info) => {
  logError(err)
}
```

### 3. **Optimistic Updates**
```typescript
const placeOrder = async (order: Order) => {
  // Optimistic update
  orders.value.push(order)

  try {
    await orderApi.create(order)
  } catch (error) {
    // Rollback on error
    orders.value = orders.value.filter(o => o.id !== order.id)
    throw error
  }
}
```

### 4. **Code Splitting**
```typescript
// Vue Router
const routes = [
  {
    path: '/orders',
    component: () => import('./views/OrdersView.vue')
  }
]

// React Router
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
```

### 5. **Performance Monitoring**
```typescript
// Vue 3
import { onMounted } from 'vue'

onMounted(() => {
  performance.mark('component-mounted')
  performance.measure('mount-time', 'navigationStart', 'component-mounted')
})

// React
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      console.log(entry.name, entry.duration)
    })
  })
  observer.observe({ entryTypes: ['measure'] })
}, [])
```

---

# Real-World Examples

## Example 1: E-Commerce Order System

### Bounded Contexts
1. **Sales Context** - Order placement, pricing
2. **Inventory Context** - Stock management
3. **Shipping Context** - Delivery tracking
4. **Payment Context** - Payment processing

### Domain Model (Sales Context)
```typescript
// Aggregate Root
class Order {
  private id: OrderId
  private customerId: CustomerId
  private items: OrderItem[] = []
  private pricing: OrderPricing
  private status: OrderStatus

  placeOrder(): void {
    this.validateMinimumOrder()
    this.pricing.calculate()
    this.reserveInventory()
    this.status = OrderStatus.Placed
    this.addEvent(new OrderPlaced(this.id))
  }

  private validateMinimumOrder(): void {
    if (this.pricing.total.amount < 10) {
      throw new MinimumOrderNotMet()
    }
  }

  private reserveInventory(): void {
    this.items.forEach(item => {
      this.addEvent(new InventoryReserved(item.productId, item.quantity))
    })
  }
}

// Value Object
class OrderPricing {
  constructor(
    public subtotal: Money,
    public tax: Money,
    public shipping: Money
  ) {}

  get total(): Money {
    return this.subtotal.add(this.tax).add(this.shipping)
  }

  static calculate(items: OrderItem[]): OrderPricing {
    const subtotal = items.reduce(
      (sum, item) => sum.add(item.totalPrice),
      Money.zero('USD')
    )
    const tax = subtotal.multiply(0.1) // 10% tax
    const shipping = Money.create(5, 'USD')

    return new OrderPricing(subtotal, tax, shipping)
  }
}
```

## Example 2: Banking Transaction System

```typescript
// Aggregate
class BankAccount {
  private id: AccountId
  private balance: Money
  private dailyWithdrawalLimit: Money
  private transactions: Transaction[] = []

  withdraw(amount: Money): void {
    this.ensureSufficientBalance(amount)
    this.ensureWithinDailyLimit(amount)

    this.balance = this.balance.subtract(amount)
    this.transactions.push(
      Transaction.withdrawal(amount, new Date())
    )

    this.addEvent(new MoneyWithdrawn(this.id, amount))
  }

  private ensureSufficientBalance(amount: Money): void {
    if (this.balance.isLessThan(amount)) {
      throw new InsufficientBalanceException()
    }
  }

  private ensureWithinDailyLimit(amount: Money): void {
    const todayTotal = this.getTodayWithdrawals()
    if (todayTotal.add(amount).isGreaterThan(this.dailyWithdrawalLimit)) {
      throw new DailyLimitExceededException()
    }
  }
}

// Domain Service
class MoneyTransferService {
  transfer(from: BankAccount, to: BankAccount, amount: Money): void {
    from.withdraw(amount)
    to.deposit(amount)

    this.eventBus.publish(
      new MoneyTransferred(from.id, to.id, amount)
    )
  }
}
```

---

# Summary & Decision Guide

## Quick Decision Tree

```
Is your application complex with rich business logic?
├─ YES → Use Hexagonal + DDD
│   ├─ E-commerce
│   ├─ Banking/Finance
│   ├─ Healthcare
│   └─ Enterprise systems
│
└─ NO → Is it mostly CRUD?
    ├─ YES → Use Modular Architecture
    │   ├─ Admin panels
    │   ├─ Blogs
    │   └─ Simple APIs
    │
    └─ NO → Will requirements evolve significantly?
        ├─ YES → Use Hexagonal (future-proof)
        └─ NO → Use Modular (faster development)
```

## Architecture Checklist

### Choose Hexagonal + DDD if:
- ✅ Complex business rules
- ✅ Multiple interfaces (REST, GraphQL, gRPC)
- ✅ Long-term project (3+ years)
- ✅ Testing is critical
- ✅ Team familiar with DDD

### Choose Modular if:
- ✅ CRUD-heavy application
- ✅ Small to medium size
- ✅ Tight deadlines
- ✅ Simple business logic
- ✅ Junior team

---

**Last Updated:** 2025-12-24
**Version:** 1.0.0
