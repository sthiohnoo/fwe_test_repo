import { BaseLayout } from '../layout/BaseLayout.tsx';
import { useApiClient } from '../hooks/useApiClient.ts';
import React, { useCallback, useEffect, useState } from 'react';
import {
  PostShoppingListsRequest,
  PutShoppingListsShoppingListIdItemsItemIdRequest,
  ShoppingList,
} from '../adapter/api/__generated';
import { Box, Button, HStack, Input, Select, useDisclosure } from '@chakra-ui/react';
import { ShoppingListTable } from './components/ShoppingListTable.tsx';
import { CreateShoppingListModal } from './components/CreateShoppingListModal.tsx';
import { AddItemFormValues, AddItemTable } from '../components/AddItemTable.tsx';
import axios from 'axios';

export const ShoppingListPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isItemTableOpen,
    onOpen: onItemTableOpen,
    onClose: onItemTableClose,
  } = useDisclosure(); // Disclosure for ItemTable

  const client = useApiClient();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  const loadShoppingLists = useCallback(async () => {
    const res = await client.getShoppingLists();
    setShoppingLists(res.data);
  }, [client]);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);

  const onCreateShoppingList = async (data: PostShoppingListsRequest) => {
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

  const onClickAddItemToShoppingList = async (list: ShoppingList) => {
    onItemTableOpen();
    setShoppingListToBeUpdated(list);
  };

  const onAddItemToShoppingList = async (values: AddItemFormValues) => {
    if (shoppingListsToBeUpdated) {
      const request: PutShoppingListsShoppingListIdItemsItemIdRequest = {
        quantity: parseInt(values.quantity as unknown as string, 10),
        isPurchased: String(values.isPurchased) === 'true',
      };

      await client.putShoppingListsShoppingListIdItemsItemId(
        shoppingListsToBeUpdated.id,
        values.id,
        request,
      );
      await loadShoppingLists();
    }
  };

  const onClickDeleteItem = async (list: ShoppingList, itemId: string) => {
    await client.deleteShoppingListsShoppingListIdItemsItemId(list.id, itemId);
    await loadShoppingLists();
  };

  const [searchType, setSearchType] = useState('name');

  const handleSearchNameOrDescChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    if (searchValue === '') {
      await loadShoppingLists();
      return;
    }

    try {
      const params = {
        [searchType]: searchValue,
      };
      const res = await client.getShoppingListsSearch(params.name, params.description);

      const res2: ShoppingList[] = [];
      for (let i = 0; i < res.data.length; i++) {
        const shoppingListResponse = await client.getShoppingListsId(res.data[i].id);
        res2.push(shoppingListResponse.data);
      }
      setShoppingLists(res2.length > 0 ? res2 : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setShoppingLists([]);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleSearchItemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    if (searchValue === '') {
      await loadShoppingLists();
      return;
    }

    try {
      const itemRes = await client.getItemsNameItemName(searchValue);
      const itemIds = itemRes.data.id;

      const res = await client.getShoppingListsItemsItemId(itemIds);

      const res2: ShoppingList[] = [];
      for (let i = 0; i < res.data.length; i++) {
        const shoppingListResponse = await client.getShoppingListsId(res.data[i].listId);
        res2.push(shoppingListResponse.data);
      }
      setShoppingLists(res2.length > 0 ? res2 : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setShoppingLists([]);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <BaseLayout>
      <Box>
        <HStack spacing={3} mb={4}>
          <Button
            variant={'solid'}
            colorScheme={'blue'}
            onClick={() => {
              setShoppingListToBeUpdated(null);
              onOpen();
            }}
            flex="0 0 15%"
          >
            Create new ShoppingList
          </Button>
          <Box border="1px" borderColor="blue" borderRadius="md" display="flex" flex="1">
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              flex=" 0 0 25%"
            >
              <option value="name">Name</option>
              <option value="description">Description</option>
            </Select>
            <Input
              placeholder={`Search ShoppingList by ${searchType}`}
              onChange={handleSearchNameOrDescChange}
              flex="1"
              border="none"
            />
          </Box>
          <Input
            placeholder="Search ShoppingList by included item"
            onChange={handleSearchItemChange}
            flex="1"
            border="1px"
            borderColor="blue"
            borderRadius="md"
          />
        </HStack>
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
        <AddItemTable
          isOpen={isItemTableOpen}
          onClose={onItemTableClose}
          onSubmit={onAddItemToShoppingList}
        />{' '}
        {/* Render ItemTable */}
        <ShoppingListTable
          data={shoppingLists}
          onClickDeleteShoppingList={onDeleteShoppingList}
          onClickUpdateShoppingList={onClickUpdateShoppingList}
          onClickAddItemToShoppingList={onClickAddItemToShoppingList}
          onClickDeleteItem={onClickDeleteItem}
        />
      </Box>
    </BaseLayout>
  );
};
