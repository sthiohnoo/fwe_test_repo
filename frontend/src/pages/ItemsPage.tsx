import { BaseLayout } from '../layout/BaseLayout.tsx';
import { Box, Button, HStack, useDisclosure, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { ItemTable } from './components/ItemTable.tsx';
import { useApiClient } from '../hooks/useApiClient.ts';
import { Item, PutItemsIdRequest } from '../adapter/api/__generated';
import { UpdateItemModal } from '../components/updateItemModal.tsx';

export const ItemsPage = () => {
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();

  const client = useApiClient();
  const toast = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [itemsToBeUpdated, setItemToBeUpdated] = useState<Item | null>(null);

  const loadItems = useCallback(async () => {
    const res = await client.getItems();
    setItems(res.data);
  }, [client]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onClickCreateItem = async (item: Item) => {};
  const onClickDeleteItem = async (item: Item) => {
    try {
      await client.deleteItemsId(item.id);
      await loadItems();
    } catch (_error) {
      toast({
        description: 'Deletion canceled. Item exists in a ShoppingList',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  };
  const onClickOpenUpdateItemModal = async (item: Item) => {
    setItemToBeUpdated(item);
    onUpdateOpen();
  };

  const onSubmitUpdateItem = async (item: PutItemsIdRequest) => {
    const reqBody: PutItemsIdRequest = {
      name: item.name,
      description: item.description,
    };
    await client.putItemsId(itemsToBeUpdated?.id ?? '', reqBody);
    await loadItems();
    console.log('Updating item: ', itemsToBeUpdated?.id, reqBody);
    onUpdateClose();
    setItemToBeUpdated(null);
  };

  return (
    <BaseLayout>
      <Box>
        <HStack spacing={3} mb={4}>
          <Button variant={'solid'} colorScheme={'blue'} onClick={() => {}} flex="0 0 15%">
            Create new Item(s)
          </Button>
          {/*
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
          <IconButton
            aria-label={'Show Favorites'}
            icon={<StarIcon color="yellow.400" />}
            onClick={() => onClickShowFavorites()}
          />{' '}
          <IconButton
            aria-label={'Show All'}
            icon={<IoHomeOutline />}
            onClick={() => onClickShowAll()}
          />{' '}*/}
        </HStack>
        <UpdateItemModal
          isOpen={isUpdateOpen}
          onClose={onUpdateClose}
          onSubmit={onSubmitUpdateItem}
        />{' '}
        <ItemTable
          data={items}
          onClickDeleteItem={onClickDeleteItem}
          onClickUpdateItem={onClickOpenUpdateItemModal}
        />
      </Box>
    </BaseLayout>
  );
};
