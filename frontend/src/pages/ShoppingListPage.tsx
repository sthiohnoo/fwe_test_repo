import { BaseLayout } from '../layout/BaseLayout.tsx';
import { useApiClient } from '../hooks/useApiClient.ts';
import { useCallback, useEffect, useState } from 'react';
import { PostShoppingListsRequest, ShoppingList } from '../adapter/api/__generated';
import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { ShoppingListTable } from './components/ShoppingListTable.tsx';
import { CreateShoppingListModal } from './components/CreateShoppingListModal.tsx';

export const ShoppingListPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const client = useApiClient();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  const loadShoppingLists = useCallback(async () => {
    const res = await client.getShoppingLists();
    setShoppingLists(res.data);
  }, [client]);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);
  console.log(shoppingLists);

  const onCreateShoppingList = async (data: PostShoppingListsRequest) => {
    console.log('das sind Daten:', data);
    await client.postShoppingLists(data);
    await loadShoppingLists();
    onClose();
  };

  const onDeleteShoppingList = async (list: ShoppingList) => {
    await client.deleteShoppingListsId(list.id);
    await loadShoppingLists();
    setShoppingListToBeUpdated(null);
  };

  const [shoppingListsToBeUpdated, setShoppingListToBeUpdated] = useState<ShoppingList | null>(
    null,
  );

  const onClickUpdateShoppingList = async (list: ShoppingList) => {
    setShoppingListToBeUpdated(list);
    onOpen();
  };

  const onUpdateShoppingList = async (list: PostShoppingListsRequest) => {
    // @ts-expect-error todo
    await client.putShoppingListsId(shoppingListsToBeUpdated?.id, list);

    await loadShoppingLists();
    onClose();
    setShoppingListToBeUpdated(null);
  };

  return (
    <BaseLayout>
      <Box>
        <Button
          variant={'solid'}
          colorScheme={'blue'}
          onClick={() => {
            setShoppingListToBeUpdated(null);
            onOpen();
          }}
        >
          Create new ShoppingList
        </Button>
        <CreateShoppingListModal
          initialValues={shoppingListsToBeUpdated}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={(updatedShoppingList) => {
            const updatedItems =
              updatedShoppingList.items?.map((item) => {
                return { id: item.id ?? undefined, name: item.name };
              }) ?? [];

            if (shoppingListsToBeUpdated) {
              // TODO: i cannot update the items(quantity and ispurchased)
              console.log('Updating ShoppingList:', updatedShoppingList, updatedItems);
              onUpdateShoppingList({ ...updatedShoppingList, items: updatedItems });
            } else {
              // TODO: i cannot create new items
              console.log('Create ShoppingList:', updatedShoppingList, updatedItems);
              onCreateShoppingList({ ...updatedShoppingList });
            }
          }}
        />
        <ShoppingListTable
          data={shoppingLists}
          onClickDeleteShoppingList={onDeleteShoppingList}
          onClickUpdateShoppingList={onClickUpdateShoppingList}
        />
      </Box>
    </BaseLayout>
  );
};
