import lang from 'i18n-js';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ContextMenuButton } from 'react-native-ios-context-menu';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { ButtonPressAnimation } from '../animations';
import { BottomRowText } from '../coin-row';
import CoinCheckButton from '../coin-row/CoinCheckButton';
import { ContactAvatar } from '../contacts';
import ImageAvatar from '../contacts/ImageAvatar';
import { Icon } from '../icons';
import { Centered, Column, ColumnWithMargins, Row } from '../layout';
import { Text, TruncatedAddress, TruncatedText } from '../text';
import useExperimentalFlag, {
  NOTIFICATIONS,
} from '@rainbow-me/config/experimentalHooks';
import { toChecksumAddress } from '@rainbow-me/handlers/web3';
import {
  removeFirstEmojiFromString,
  returnStringFirstEmoji,
} from '@rainbow-me/helpers/emojiHandler';
import styled from '@rainbow-me/styled-components';
import { fonts, fontWithWidth, getFontSize } from '@rainbow-me/styles';
import {
  abbreviations,
  deviceUtils,
  profileUtils,
  showActionSheetWithOptions,
} from '@rainbow-me/utils';

const maxAccountLabelWidth = deviceUtils.dimensions.width - 88;
const NOOP = () => undefined;

const sx = StyleSheet.create({
  accountLabel: {
    fontFamily: fonts.family.SFProRounded,
    fontSize: getFontSize(fonts.size.lmedium),
    fontWeight: fonts.weight.medium,
    letterSpacing: fonts.letterSpacing.roundedMedium,
    maxWidth: maxAccountLabelWidth,
  },
  accountRow: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 19,
  },
  bottomRowText: {
    fontWeight: fonts.weight.medium,
    letterSpacing: fonts.letterSpacing.roundedMedium,
  },
  coinCheckIcon: {
    width: 60,
  },
  editIcon: {
    color: '#0E76FD',
    fontFamily: fonts.family.SFProRounded,
    fontSize: getFontSize(fonts.size.large),
    fontWeight: fonts.weight.heavy,
    textAlign: 'center',
  },
  gradient: {
    alignSelf: 'center',
    borderRadius: 24,
    height: 26,
    justifyContent: 'center',
    marginLeft: 19,
    textAlign: 'center',
  },
  rightContent: {
    flex: 0,
    flexDirection: 'row',
    marginLeft: 48,
  },
});

const gradientProps = {
  pointerEvents: 'none',
  style: sx.gradient,
};

const StyledTruncatedText = styled(TruncatedText)({
  ...sx.accountLabel,
  ...fontWithWidth(sx.accountLabel.fontWeight),
});

const StyledBottomRowText = styled(BottomRowText)({
  ...sx.bottomRowText,
  ...fontWithWidth(sx.bottomRowText.fontWeight),
});

const ReadOnlyText = styled(Text).attrs({
  align: 'center',
  letterSpacing: 'roundedMedium',
  size: 'smedium',
  weight: 'semibold',
})({
  paddingHorizontal: 8,
});

const OptionsIcon = ({ onPress }) => {
  const { colors } = useTheme();
  return (
    <ButtonPressAnimation onPress={onPress} scaleTo={0.9}>
      <Centered height={40} width={60}>
        {android ? (
          <Icon circle color={colors.appleBlue} name="threeDots" tightDots />
        ) : (
          <Text style={sx.editIcon}>􀍡</Text>
        )}
      </Centered>
    </ButtonPressAnimation>
  );
};

export default function AddressRow({
  contextMenuActions,
  data,
  editMode,
  onPress,
  onEditWallet,
  watchOnly,
}) {
  const {
    address,
    balance,
    color: accountColor,
    ens,
    image: accountImage,
    isSelected,
    isReadOnly,
    label,
    walletId,
  } = data;

  const { colors, isDarkMode } = useTheme();
  const notificationsEnabled = useExperimentalFlag(NOTIFICATIONS);

  let cleanedUpBalance = balance;
  if (balance === '0.00') {
    cleanedUpBalance = '0';
  }

  let cleanedUpLabel = null;
  if (label) {
    cleanedUpLabel = removeFirstEmojiFromString(label);
  }

  const walletLabel =
    cleanedUpLabel ||
    ens ||
    abbreviations.formatAddressForDisplay(toChecksumAddress(address), 4, 6);

  const onOptionsPress = useCallback(() => {
    onEditWallet(walletId, address, cleanedUpLabel);
  }, [address, cleanedUpLabel, onEditWallet, walletId]);

  const linearGradientProps = useMemo(
    () => ({
      ...gradientProps,
      colors: [
        colors.alpha(colors.blueGreyDark, 0.03),
        colors.alpha(colors.blueGreyDark, isDarkMode ? 0.02 : 0.06),
      ],
      end: { x: 1, y: 1 },
      start: { x: 0, y: 0 },
    }),
    [colors, isDarkMode]
  );

  const menuConfig = useMemo(() => {
    return {
      menuItems: [
        {
          actionKey: 'remove',
          actionTitle: lang.t('wallet.action.remove'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'trash.fill',
          },
          menuAttributes: ['destructive'],
        },
        {
          actionKey: 'notifications',
          actionTitle: lang.t('wallet.action.notifications'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'bell.fill',
          },
        },
        {
          actionKey: 'edit',
          actionTitle: lang.t('wallet.action.edit'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'pencil',
          },
        },
      ],
      menuTitle: walletLabel,
    };
  }, [walletLabel]);

  const onPressAndroidActions = useCallback(() => {
    const androidActions = [
      lang.t('settings.theme_section.system'),
      lang.t('settings.theme_section.light'),
      lang.t('settings.theme_section.dark'),
    ];

    showActionSheetWithOptions(
      {
        options: androidActions,
        showSeparators: true,
        title: walletLabel,
      },
      idx => {
        if (idx === 0) {
          console.log('hi1');
        } else if (idx === 1) {
          console.log('hi2');
        } else if (idx === 2) {
          console.log('hi3');
        }
      }
    );
  }, [walletLabel]);

  const handleSelectMenuItem = useCallback(
    ({ nativeEvent: { actionKey } }) => {
      if (actionKey === 'remove') {
        contextMenuActions?.remove(walletId, address);
      } else if (actionKey === 'notifications') {
        contextMenuActions?.notifications(walletLabel);
      } else if (actionKey === 'edit') {
        contextMenuActions?.edit(walletId, address);
      }
    },
    [address, contextMenuActions, walletId, walletLabel]
  );

  const RowItem = () => (
    <ButtonPressAnimation
      enableHapticFeedback={!editMode}
      onLongPress={!watchOnly ? onOptionsPress : onPress}
      onPress={editMode ? onOptionsPress : onPress}
      scaleTo={editMode ? 1 : 0.98}
    >
      <Row align="center">
        <Row align="center" flex={1} height={59}>
          {accountImage ? (
            <ImageAvatar image={accountImage} marginRight={10} size="medium" />
          ) : (
            <ContactAvatar
              color={accountColor}
              marginRight={10}
              size="medium"
              value={
                returnStringFirstEmoji(label) ||
                profileUtils.addressHashedEmoji(address) ||
                label ||
                ens
              }
            />
          )}
          <ColumnWithMargins margin={android ? -6 : 3}>
            {cleanedUpLabel || ens ? (
              <StyledTruncatedText color={colors.dark}>
                {cleanedUpLabel || ens}
              </StyledTruncatedText>
            ) : (
              <TruncatedAddress
                address={address}
                color={colors.dark}
                firstSectionLength={6}
                size="smaller"
                style={sx.accountLabel}
                truncationLength={4}
                weight="medium"
              />
            )}
            <StyledBottomRowText color={colors.alpha(colors.blueGreyDark, 0.5)}>
              {cleanedUpBalance || 0} ETH
            </StyledBottomRowText>
          </ColumnWithMargins>
        </Row>
        <Column style={sx.rightContent}>
          {isReadOnly && (
            <LinearGradient
              {...linearGradientProps}
              marginRight={editMode || isSelected ? -9 : 19}
            >
              <ReadOnlyText color={colors.alpha(colors.blueGreyDark, 0.5)}>
                {lang.t('wallet.change_wallet.watching')}
              </ReadOnlyText>
            </LinearGradient>
          )}
          {!editMode && isSelected && (
            <CoinCheckButton style={sx.coinCheckIcon} toggle={isSelected} />
          )}
          {editMode && <OptionsIcon onPress={NOOP} />}
        </Column>
      </Row>
    </ButtonPressAnimation>
  );

  return (
    <View style={sx.accountRow}>
      {notificationsEnabled && editMode ? (
        <ContextMenuButton
          menuConfig={menuConfig}
          {...(android ? { onPress: onPressAndroidActions } : {})}
          isMenuPrimaryAction
          onPressMenuItem={handleSelectMenuItem}
          useActionSheetFallback={false}
        >
          <RowItem />
        </ContextMenuButton>
      ) : (
        <RowItem />
      )}
    </View>
  );
}
