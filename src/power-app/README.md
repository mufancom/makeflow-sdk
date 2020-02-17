### 添加一份新资源要修改以下内容

#### storage

1. 在 `core/storage` 中增加对应资源的 storage 文件, 如 `power-custom-checkable-item.ts`
2. 在 `core/storage/storage.ts` 中的 `Docs` 与 `Storages` 加上新增的类型
3. 在 `index.ts` 中导出

#### definition

在 `core/version.ts` 中增加资源的定义 如

```ts
// power-custom-checkable-item.ts
export namespace PowerCustomCheckableItem { ... }
```

#### net

1. 在 `core/net/events` 中添加对应资源的 event 文件，如 `power-custom-checkable-item.ts`

2. 在 net 的 各 adapter 中监听新资源的对应的 http 请求并触发 event 如:

```ts
// koa.ts

post('/power-custom-checkable-item/:name', context => {
        let {
          params,
          request: {body},
        } = context;

        this.emit<PowerCustomCheckableItemEvent>(
          'power-custom-checkable-item',
          {
            payload: body,
            params,
          },
          getResponse<PowerCustomCheckableItemEvent>(context),
        );
      }
```

#### db

1. 在 `core/db/db.ts` 中，声明新资源的处理包 包括四个抽象函数和对应的 storage class 如

   ```ts
   // db.ts
     private readonly 'power-custom-checkable-item' = {
       create: this.createPowerGlanceDoc,
       delete: this.deletePowerGlanceDoc,
       update: this.updatePowerGlanceDoc,
       query: this.getPowerGlanceDoc,
       class: PowerGlance,
     };

     // PowerCustomCheckableItem
     protected abstract async getPowerCustomCheckableItemDoc(
       doc: Partial<PowerCustomCheckableItemDoc>,
     ): Promise<PowerCustomCheckableItemDoc | undefined>;

     protected abstract async createPowerCustomCheckableItemDoc(
       doc: PowerCustomCheckableItemDoc,
     ): Promise<void>;

     protected abstract async deletePowerCustomCheckableItemDoc(
       doc: Partial<PowerCustomCheckableItemDoc>,
     ): Promise<void>;

     protected abstract async updatePowerCustomCheckableItemDoc(
       oDoc: PowerCustomCheckableItemDoc,
       nDoc: PowerCustomCheckableItemDoc,
     ): Promise<void>;
   ```

2. 在 `core/db` 中的各个 adapter 中实现对应方法;

### app

在 `app.ts` 监听 net 发出的 event 并借助以上定义的内容实现处理逻辑
