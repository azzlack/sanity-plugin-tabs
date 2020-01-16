Sanity Tabs Plugin
=========
Input component for rendering fieldsets as tabs

### How does it look?
![Tabs](/images/tabs.png?raw=true "Tabs")
![Tabs inside tabs](/images/tabs-in-tabs.png?raw=true "Tabs inside tabs")

### How do I use it?
Just add `inputComponent: Tabs` to your field. Please note that the field type must be `object`.

```
import Tabs from 'sanity-plugin-tabs'

export default {
  type: "document",
  title: `Frontpage`,
  name: `frontpage`,
  fields: [
    {
      name: "content",
      type: "object",
      inputComponent: Tabs,

      fieldsets: [
        { name: "main", title: "Main" },
        { name: "aside", title: "Aside" },
        { name: "meta", title: "Meta" },
      ],
      
      fields: [
        {
          type: "object",
          name: "mainTitle",
          title: "Main Title",
          fieldset: "main",

          fieldsets: [
            { name: "ingress", title: "Ingress" },
          ],

          fields: [
            {
              type: "string",
              name: "header",
              title: "Header"
            },
            {
              type: "string",
              name: "ingressText",
              title: "Text",
              fieldset: "ingress"
            },
          ]
        },
        {
          type: "string",
          name: "info",
          title: "Information",
          fieldset: "aside"
        },
        {
          type: "object",
          name: "aside",
          fieldset: "meta",
          inputComponent: Tabs,

          fieldsets: [
            { name: "tags", title: "Tags" },
            { name: "categories", title: "Categories" },
          ],

          fields: [
            {
              type: "string",
              name: "contentType",
              title: "Content Type",
              fieldset: "tags"
            },
            {
              type: "string",
              name: "category",
              title: "Category",
              fieldset: "categories"
            },
          ]
        },
      ]
    }
  ]
};
```